exports.config = {
    execArgv: ['--inspect'],
    specs: [
        './test/specs/tests.js'
    ],
    maxInstances: 10,
    capabilities: [{
        maxInstances: 5,
        browserName: 'chrome'
    }],
    sync: true,
    logLevel: 'silent',
    coloredLogs: true,
    bail: 0,
    screenshotPath: './errorShots/',
    baseUrl: 'https://domklim.herokuapp.com',
    waitforTimeout: 20000,
    connectionRetryTimeout: 90000,
    connectionRetryCount: 3,
    services: ['selenium-standalone'],
    framework: 'mocha',
    reporters: ['spec','allure'],
    reporterOptions: {
        allure: {
            outputDir: 'allure-results'
        }
    },
    mochaOpts: {
        ui: 'bdd',
        timeout: 20000,
        compilers: ['js:babel-register']
    },
    before: function() {
      var chai = require('chai');
      global.expect = chai.expect;
      chai.Should();
      }
}
