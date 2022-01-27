const readline = require('readline');

class WordIndexer {
    constructor(minWordLength = 3, maxWordLength = 7) {
        this._minWordLength = minWordLength;
        this._maxWordLength = maxWordLength;
    }

    index(stream) {
        return new Promise((resolve, reject) => {
            let entries = {};

            const rl = readline.createInterface({
                input: stream,
                crlfDelay: Infinity
            });

            rl.on('line', (word) => {
                if (word.length >= this._minWordLength && word.length <= this._maxWordLength) {
                    const index = [...word.toLowerCase()]
                        .map(c => {
                            switch (c) {
                                case 'a': case 'b': case 'c':           return '2';
                                case 'd': case 'e': case 'f':           return '3';
                                case 'g': case 'h': case 'i':           return '4';
                                case 'j': case 'k': case 'l':           return '5';
                                case 'm': case 'n': case 'o':           return '6';
                                case 'p': case 'q': case 'r': case 's': return '7';
                                case 't': case 'u': case 'v':           return '8';
                                case 'w': case 'x': case 'y': case 'z': return '9';
                                default:
                                    throw 'None roman character detected';
                            }
                        })
                        .join('');

                    entries[index] = [...(entries[index] || []), word];
                }
            });

            rl.on('close', () => {
                resolve(entries);
            });
        });
    }
}

module.exports = WordIndexer;