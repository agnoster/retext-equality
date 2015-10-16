'use strict';

/* eslint-env mocha */

/*
 * Dependencies.
 */

var assert = require('assert');
var retext = require('retext');
var equality = require('./');

/*
 * Methods.
 */

var equal = assert.strictEqual;
var dequal = assert.deepEqual;

/*
 * Helpers.
 */

/**
 * Helper to get warnings from `equality` in `doc`.
 */
function process(doc) {
    var messages;

    retext().use(equality).process(doc, function (err, file) {
        assert.ifError(err);

        messages = file.messages;
    });

    return messages.map(String);
}

/*
 * Tests.
 */

describe('retext-equality', function () {
    it('should not fail on prototypal properties', function () {
        dequal(process('toString and constructor.'), []);
    });

    it('should patch `description` when applicable', function () {
        var doc = 'Their child has a birth defect.';

        retext().use(equality).process(doc, function (err, file) {
            assert.ifError(err);

            equal(file.messages[0].note,
                'If possible, describe exacly what this is. (source: http://ncdj.org/style-guide/)'
            );
        });
    });

    it('should warn about gender polarising words', function () {
        dequal(process('her bicycle.'), [
            '1:1-1:4: `her` may be insensitive, use `their`, `theirs`, `them` instead'
        ]);

        dequal(process('Ze frenchmen are comming.'), [
            '1:4-1:13: `frenchmen` may be insensitive, use `french` instead'
        ]);
    });

    it('should warn case-insensitive', function () {
        dequal(process('Her bicycle.'), [
            '1:1-1:4: `Her` may be insensitive, use `Their`, `Theirs`, `Them` instead'
        ]);

        dequal(process('Frenchmen are comming.'), [
            '1:1-1:10: `Frenchmen` may be insensitive, use `French` instead'
        ]);
    });

    it('should ignore `/` comparison', function () {
        var messages = process('Her/his bicycle.');

        dequal(messages, []);
    });

    it('should ignore `and` comparison', function () {
        var messages = process('Her and his bicycle.');

        dequal(messages, []);
    });

    it('should ignore `or` comparison', function () {
        var messages = process('Her or his bicycle.');

        dequal(messages, []);
    });

    it('should NOT ignore other close words', function () {
        var messages = process('Her bike, his bicycle.');

        dequal(messages, [
            '1:1-1:4: `Her` may be insensitive, use `Their`, `Theirs`, `Them` instead',
            '1:11-1:14: `his` may be insensitive, use `their`, `theirs`, `them` instead'
        ]);
    });

    describe('Should ignore dashes and ampersands', function () {
        it('Two bipolar magnets', function () {
            var messages = process('Two bipolar magnets.');

            dequal(messages, [
                '1:5-1:12: `bipolar` may be insensitive, use `fluctuating`, `person with schizophrenia`, `person with bipolar disorder` instead'
            ]);
        });

        it('Two bi-polar magnets', function () {
            var messages = process('Two bi-polar magnets.');

            dequal(messages, [
                '1:5-1:13: `bi-polar` may be insensitive, use `fluctuating`, `person with schizophrenia`, `person with bipolar disorder` instead'
            ]);
        });

        it('Downs Syndrome', function () {
            var messages = process('Downs Syndrome.');

            dequal(messages, [
                '1:1-1:6: `Downs Syndrome` may be insensitive, use `Down Syndrome` instead'
            ]);
        });

        it('Down’s Syndrome', function () {
            var messages = process('Down’s Syndrome.');

            dequal(messages, [
                '1:1-1:7: `Down’s Syndrome` may be insensitive, use `Down Syndrome` instead'
            ]);
        });

        it('Downs Syndrome', function () {
            var messages = process('Downs Syndrome.');

            dequal(messages, [
                '1:1-1:6: `Downs Syndrome` may be insensitive, use `Down Syndrome` instead'
            ]);
        });
    });

    it('should warn about disability-inconsiderate words', function () {
        dequal(process('Eric is mentally ill.'), [
            '1:9-1:17: `mentally ill` may be insensitive, use `rude`, `mean`, `disgusting`, `vile`, `person with symptoms of mental illness`, `person with mental illness`, `person with symptoms of a mental disorder`, `person with a mental disorder` instead'
        ]);

        dequal(process('Eric is Mentally ill.'), [
            '1:9-1:17: `Mentally ill` may be insensitive, use `Rude`, `Mean`, `Disgusting`, `Vile`, `Person with symptoms of mental illness`, `Person with mental illness`, `Person with symptoms of a mental disorder`, `Person with a mental disorder` instead'
        ]);
    });

    it('should warn about relational insensitivities', function () {
        var messages = process('Sam set up the network as master and slave.');

        dequal(messages, [
            '1:27-1:33: `master` / `slave` may be insensitive, use `primary` / `replica` instead'
        ]);
    });

    it('should warn about relational insensitivities supporting case', function () {
        dequal(process('Master and slave can be quite hurtful.'), [
            '1:1-1:7: `Master` / `slave` may be insensitive, use `Primary` / `Replica` instead'
        ]);

        dequal(process('master and Slave can be quite hurtful.'), [
            '1:1-1:7: `master` / `Slave` may be insensitive, use `primary` / `replica` instead'
        ]);
    });

    it('should re-order relationals based on which came first', function () {
        dequal(process('Slaves. Master.'), [
            '1:1-1:7: `Slaves` / `Master` may be insensitive, use `Replica` / `Primary` instead'
        ]);
    });

    it('should warn about relationals across sentences', function () {
        var messages = process('All changes are written to the master server. The slaves are read-only copies of master.');

        dequal(messages, [
            '1:32-1:38: `master` / `slaves` may be insensitive, use `primary` / `replica` instead'
        ]);
    });
});

describe('Phrasing', function () {
    describe('Should warn', function () {
        it('This is insane', function () {
            var messages = process('This is insane.');

            dequal(messages, [
                '1:9-1:15: `insane` may be insensitive, use `rude`, `mean`, `disgusting`, `vile`, `person with symptoms of mental illness`, `person with mental illness`, `person with symptoms of a mental disorder`, `person with a mental disorder` instead'
            ]);
        });

        it('I like him', function () {
            var messages = process('I like him.');

            dequal(messages, [
                '1:8-1:11: `him` may be insensitive, use `their`, `theirs`, `them` instead'
            ]);
        });

        it('Manned spacecraft', function () {
            var messages = process('Manned spacecraft.');

            dequal(messages, [
                '1:1-1:7: `Manned` may be insensitive, use `Staffed`, `Crewed`, `Pilotted` instead'
            ]);
        });

        it('Moaning, like wormen are always doing', function () {
            var messages = process('Moaning, like wormen are always doing.');

            dequal(messages, [
                '1:1-1:8: `Moaning` may be insensitive, use `Whining`, `Complaining`, `Crying` instead'
            ]);
        });

        it('N*gg*rs is not a nice word', function () {
            var messages = process('Niggers is not a nice word.');

            dequal(messages, [
                '1:1-1:8: `Niggers` may be insensitive, use `African americans`, `South americans`, `Caribbean people`, `Africans`, `People of color`, `Black people` instead'
            ]);
        });

        it('He muttered some lame excuse', function () {
            var messages = process('He muttered some lame excuse.');

            dequal(messages, [
                '1:1-1:3: `He` may be insensitive, use `They`, `It` instead',
                '1:18-1:22: `lame` may be insensitive, use `boring`, `dull` instead'
            ]);
        });

        it('He muttered some lame excuse', function () {
            var messages = process('He muttered some lame excuse.');

            dequal(messages, [
                '1:1-1:3: `He` may be insensitive, use `They`, `It` instead',
                '1:18-1:22: `lame` may be insensitive, use `boring`, `dull` instead'
            ]);
        });

        it('I’m not psychotic, I didn’t have amnesia yesterday', function () {
            var messages = process('I’m not psychotic, I didn’t have amnesia yesterday.');

            dequal(messages, [
                '1:9-1:18: `psychotic` may be insensitive, use `person with a psychotic condition`, `person with psychosis` instead'
            ]);
        });

        it('Yeah, you were really psycho to him', function () {
            var messages = process('Yeah, you were really psycho to him.');

            dequal(messages, [
                '1:33-1:36: `him` may be insensitive, use `their`, `theirs`, `them` instead',
                '1:23-1:29: `psycho` may be insensitive, use `rude`, `mean`, `disgusting`, `vile`, `person with symptoms of mental illness`, `person with mental illness`, `person with symptoms of a mental disorder`, `person with a mental disorder` instead'
            ]);
        });

        it('I’m so retarded', function () {
            var messages = process('I’m so retarded.');

            dequal(messages, [
                '1:8-1:16: `retarded` may be insensitive, use `silly`, `dullard`, `person with Down Syndrome`, `person with developmental disabilities`, `delay`, `hold back` instead'
            ]);
        });

        it('This is dumb!', function () {
            var messages = process('This is dumb!');

            dequal(messages, [
                '1:9-1:13: `dumb` may be insensitive, use `foolish`, `ludicrous`, `speechless`, `silent` instead'
            ]);
        });

        it('The stupid PS3 controller.', function () {
            var messages = process('The stupid PS3 controller.');

            dequal(messages, [
                '1:5-1:11: `stupid` may be insensitive, use `foolish`, `ludicrous`, `unintelligent` instead'
            ]);
        });

        it('You almost gave me a panic attack!', function () {
            var messages = process('You almost gave me a panic attack!');

            dequal(messages, [
                '1:22-1:27: `panic attack` may be insensitive, use `fit of terror`, `scare` instead'
            ]);
        });

        it('You look so anorexic!', function () {
            var messages = process('You look so anorexic!');

            dequal(messages, [
                '1:13-1:21: `anorexic` may be insensitive, use `thin`, `slim` instead'
            ]);
        });

        it('My O.C.D. is coming out again!', function () {
            var messages = process('My O.C.D. is coming out again!');

            dequal(messages, [
                '1:4-1:10: `O.C.D.` may be insensitive, use `Obsesive`, `Pedantic`, `Niggly`, `Picky` instead'
            ]);
        });

        it('My insomnia is so bad!', function () {
            var messages = process('My insomnia is so bad!');

            dequal(messages, [
                '1:4-1:12: `insomnia` may be insensitive, use `restlessness`, `sleeplessness` instead'
            ]);
        });

        it('Yesterday I was feeling depressed.', function () {
            var messages = process('Yesterday I was feeling depressed.');

            dequal(messages, [
                '1:25-1:34: `depressed` may be insensitive, use `sad`, `blue`, `bummed out`, `person with seasonal affective disorder`, `person with psychotic depression`, `person with postpartum depression` instead'
            ]);
        });
    });

    describe('Should NOT warn', function () {
        it('he - A robust HTML entity encoder/decoder.', function () {
            var messages = process('he - A robust HTML entity encoder/decoder.');

            dequal(messages, []);
        });
    });
});

describe('ignoreTerms', function () {
    it('should skip terms explicitly ignored', function () {
        equality.config.ignoreTerms = {
            host: 'a computer server',
            pop: 'operating on a data structure'
        };

        var messages = process('The process running on the remote host will pop a job off the queue.');

        dequal(messages, []);
    });

    it('should still warn about terms not ignored', function () {
        equality.config.ignoreTerms = {
            pop: 'operating on a data structure'
        };

        var messages = process('The process running on the remote host will pop a job off the queue.');

        dequal(messages, [
            '1:35-1:39: `host` may be insensitive, use `presenter`, `entertainer` instead'
        ]);
    });
});
