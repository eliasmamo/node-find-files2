import * as path from 'path';
import { readdir, lstat, Stats } from 'fs';
import * as util from 'util';

const readdirPromise = util.promisify(readdir);
const lstatPromise = util.promisify(lstat);

export default class Finder {

  private matches: any[] = [];
  public pathErrors: any[] = [];

  constructor(options: { rootFolder: string; fileModifiedDate: Date; });
  constructor(options: { rootFolder: string; filterFunction: (strPath: string, fsStat: Stats) => void; });
  constructor(public options: any) {
    if (options.fileModifiedDate) 
      options.filterFunction = (strPath: any, fsStat: any) => (fsStat.mtime > options.fileModifiedDate) ? true : false;
  }

  async startSearch(): Promise<Stats[]> {
    await this.processFolderRecursively(this.options.rootFolder);
    return this.matches;
  }

  pathError(err: Error, strPath: string) {
    this.pathErrors.push({[strPath]: err});
  }

  checkMatch(strPath: string, stat: Stats) {
    try {
      if (this.options.filterFunction(strPath, stat)) this.matches.push({path: strPath, stat: stat });
    } catch (err) {
      this.pathError(err, strPath);
    }
  }

  async checkFile(file: string, strFolderName: string) {
    let strPath: string, stat: Stats;

    // trying to create path ot file
    try {
      strPath = path.join(strFolderName, file);
    } catch (err) {
      return this.pathError(err, file);
    }

    // checking if file exists
    try {
      stat = await lstatPromise(strPath);
    } catch (err) {
      return this.pathError(err, file);

    }

    if (!stat) {
      return this.pathError(new Error('No file found'), file);
    }

    if (stat.isDirectory()) {
      this.checkMatch(strPath, stat);
      try {
        await this.processFolderRecursively(strPath);
      } catch (err) {
        return this.pathError(err, file);
      }
    } else {
      this.checkMatch(strPath, stat);
    }

    return true;
  }

  async processFolderRecursively(strFolderName: string): Promise<any> {
    let files: any;
    try {
      files = await readdirPromise(strFolderName);
    } catch (err) {
      return this.pathError(err, strFolderName);
    }

    if (!files) return Promise.resolve(null);
    await Promise.all(files.map((file: string) => this.checkFile(file, strFolderName)));
    return true;
  }
}