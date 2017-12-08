"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const fs_1 = require("fs");
const util = require("util");
const readdirPromise = util.promisify(fs_1.readdir);
const lstatPromise = util.promisify(fs_1.lstat);
class Finder {
    constructor(options) {
        this.options = options;
        this.matches = [];
        this.pathErrors = [];
        if (options.fileModifiedDate)
            options.filterFunction = (strPath, fsStat) => (fsStat.mtime > options.fileModifiedDate) ? true : false;
    }
    startSearch() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.processFolderRecursively(this.options.rootFolder);
            return this.matches;
        });
    }
    pathError(err, strPath) {
        this.pathErrors.push({ [strPath]: err });
    }
    checkMatch(strPath, stat) {
        try {
            if (this.options.filterFunction(strPath, stat))
                this.matches.push({ path: strPath, stat: stat });
        }
        catch (err) {
            this.pathError(err, strPath);
        }
    }
    checkFile(file, strFolderName) {
        return __awaiter(this, void 0, void 0, function* () {
            let strPath, stat;
            // trying to create path ot file
            try {
                strPath = path.join(strFolderName, file);
            }
            catch (err) {
                return this.pathError(err, file);
            }
            // checking if file exists
            try {
                stat = yield lstatPromise(strPath);
            }
            catch (err) {
                return this.pathError(err, file);
            }
            if (!stat) {
                return this.pathError(new Error('No file found'), file);
            }
            if (stat.isDirectory()) {
                this.checkMatch(strPath, stat);
                try {
                    yield this.processFolderRecursively(strPath);
                }
                catch (err) {
                    return this.pathError(err, file);
                }
            }
            else {
                this.checkMatch(strPath, stat);
            }
            return true;
        });
    }
    processFolderRecursively(strFolderName) {
        return __awaiter(this, void 0, void 0, function* () {
            let files;
            try {
                files = yield readdirPromise(strFolderName);
            }
            catch (err) {
                return this.pathError(err, strFolderName);
            }
            if (!files)
                return Promise.resolve(null);
            yield Promise.all(files.map((file) => this.checkFile(file, strFolderName)));
            return true;
        });
    }
}
exports.default = Finder;
//# sourceMappingURL=node-find-files2.js.map