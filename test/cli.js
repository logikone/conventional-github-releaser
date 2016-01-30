'use strict';
var expect = require('chai').expect;
var fs = require('fs');
var githubRemoveAllReleases = require('github-remove-all-releases');
var shell = require('shelljs');
var spawn = require('child_process').spawn;

var cliPath = __dirname + '/../cli.js';

var AUTH = {
  type: 'oauth',
  token: process.env.TEST_CONVENTIONAL_GITHUB_RELEASER_TOKEN
};

describe('cli', function() {
  before(function(done) {
    shell.cd('cli');
    shell.exec('git init');
    fs.writeFileSync('test1', '');
    shell.exec('git add --all && git commit -m"First commit"');
    shell.exec('git tag v0.0.1');

    githubRemoveAllReleases(AUTH, 'stevemaotest', 'conventional-github-releaser-test', function() {
      done();
    });
  });

  after(function() {
    shell.cd('../');
  });

  it('should work', function(done) {
    var cp = spawn(cliPath, ['--pkg',  __dirname + '/fixtures/_package.json', '-t', AUTH.token, '-v'], {
      stdio: [process.stdin, null, null]
    });

    cp.stdout.on('data', function(data) {
      expect(data.toString()).to.include('state: \'fulfilled\'');
    });

    cp.on('close', function(code) {
      expect(code).to.equal(0);

      done();
    });
  });

  it('should print out error message and exit with `1` if there is one result and it errors', function(done) {
    var cp = spawn(cliPath, ['--pkg',  __dirname + '/fixtures/_package.json', '-t', AUTH.token], {
      stdio: [process.stdin, null, null]
    });

    cp.stderr.on('data', function(data) {
      expect(data.toString()).to.include('already_exists');
    });

    cp.on('close', function(code) {
      expect(code).to.equal(1);

      done();
    });
  });

  it('should print out error message and exit with `1` if there is one result and it errors with verbose', function(done) {
    var cp = spawn(cliPath, ['--pkg',  __dirname + '/fixtures/_package.json', '-t', AUTH.token, '-v'], {
      stdio: [process.stdin, null, null]
    });

    cp.stderr.on('data', function(data) {
      expect(data.toString()).to.include('already_exists');
    });

    cp.on('close', function(code) {
      expect(code).to.equal(1);

      done();
    });
  });
});
