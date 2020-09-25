let testDir = '/test/';

let config = {
    testEnvironment: 'node',
    testPathIgnorePatterns: ['/node_modules/'],
    testRegex: testDir + '.*\\.(test|spec)?\\.js$',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};

let isWin = process.platform === "win32";
if (isWin) {
    // Exclude non-Windows tests
    config.testPathIgnorePatterns = config.testPathIgnorePatterns.concat([
        testDir + 'linux/',
    ]);
} else {
    // Exclude non-Linux tests
    config.testPathIgnorePatterns = config.testPathIgnorePatterns.concat([
        testDir + 'win/',
    ]);
}

module.exports = config;
