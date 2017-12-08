import { expect } from 'chai';
import * as mocha from 'mocha';
import * as mock from 'mock-fs';
import Finder from '../src/node-find-files2';
import * as fs from 'fs';

const strFolderName = "./first";
const newFilesSinceDate = new Date();
const oldFile = mock.file({ content: 'somecontent', mtime: new Date("30 Jan 2012") });
const newFile = mock.file({ content: 'somecontent2', mtime: new Date("30 Jan 2013") });

function mockFS() {
  mock({
    'first': mock.directory({
      mtime: new Date("30 Jan 2011"),
      items: {
        'firstlevel.new': newFile,
        'firstlevel.old': oldFile,
        'second1': mock.directory({
          mtime: new Date("30 Jan 2011"),
          items: {
            'secondlevel.old': oldFile,
            'secondlevel2.old': oldFile,
            'third1': mock.directory({
              mtime: new Date("30 Jan 2011"),
              items: {
                'thirdlevel.new': newFile,
                'thirdlevel.old': oldFile
              }
            })
          }
        }),
        'second2': mock.directory({
          mtime: new Date("30 Jan 2011"),
          items: {
            'secondlevel.old': oldFile,
            'secondlevel.new': newFile,
            'third2': mock.directory({
              mtime: new Date("30 Jan 2011"),
              items: {
                'thirdlevel.new': newFile,
                'thirdlevel.old': oldFile
              }
            })
          }
        })
      }
    })
  });
}

describe('GetNewFiles', () => {
  before(function() {
    mockFS();
  });

  after(function() {
    mock.restore();
  });
  
  it("should return all files and folders when there is no filter", async function () {
    const fileSearch = new Finder({
      rootFolder: strFolderName,
      filterFunction: function () {
        return true;
      }
    });

    const files = await fileSearch.startSearch();
    return expect(files.length).to.equal(14);
  });

  it("should continue after an error on one of the files", async function () {
      const fileSearch = new Finder({
          rootFolder: strFolderName,
          filterFunction: function (strPath, fsStat) {
              if(strPath == "first/second1") {
                  throw new Error("Contrived Error");
              }
              return true;
          }
      });

      const files = await fileSearch.startSearch()
      return expect(files.length).to.equal(13);
  });

  it("should return only new files when passed a date", async function () {
      const dateCompare = new Date("01 Jan 2013");
      const fileSearch = new Finder({
          rootFolder: strFolderName,
          fileModifiedDate: dateCompare
      });

      const files = await fileSearch.startSearch();
      return expect(files.length).to.equal(4);
  });

});