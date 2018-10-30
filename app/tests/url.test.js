const assert = require('chai').assert;
const url = require('../url/url');


describe('generateHash', () => {
    it('should generate a unique hash based on an ID', () => {
        const id = '055';
        const hash = url.generateHash(id);

        assert.equal(hash, '1l');
    });

    it('should generate a unique hash based on an ID 2', () => {
        const id = '723c9b';
        const hash = url.generateHash(id);

        assert.equal(hash, 'szOr');
    });
});