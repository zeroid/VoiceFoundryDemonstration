const WordIndexer = require('../src/WordIndexer');

const Readable = require('stream').Readable;

test('it indexes a file', async () => {
    const stream = Readable.from('hello\r\nworld\r\n');
    const indexer = new WordIndexer();
    const index = await indexer.index(stream);
    expect(index).toHaveProperty('43556');
    expect(index['43556']).toEqual(expect.arrayContaining(['hello']));
    expect(index).toHaveProperty('96753');
    expect(index['96753']).toEqual(expect.arrayContaining(['world']));
});

test('it indexes a file with multiple values per index', async () => {
    const stream = Readable.from('wen\r\nyen\r\n');
    const indexer = new WordIndexer();
    const index = await indexer.index(stream);
    expect(index).toHaveProperty('936');
    expect(index['936']).toEqual(expect.arrayContaining(['wen', 'yen']));
});