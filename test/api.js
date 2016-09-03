require('es6-set/implement');
Object.is = require('object-is');

var baseUrl = 'http://localhost:8080';

casper.test.begin('WRS API', 21, function(test) {
    casper.start(baseUrl, function() {
        casper.then(function() {
            test.assertEquals(this.getPlainText(), '{"message":"wrs api"}', '/');
        });

        casper.thenOpen(baseUrl + '/setupTest/api', function() {
            test.assertEquals(this.getPlainText(), 
                              '{"message":"setupTest"}', 
                              this.getCurrentUrl().replace(baseUrl, ''));
        });

        casper.thenOpen(baseUrl + '/riders', function() {
            // API returns array in an undefined order
            var expectedRiders = new Set([
                '{"name":"Michiel"}',
                '{"name":"Henk"}'
            ]); 
            var riders = JSON.parse(this.getPlainText());
            test.assertEquals(riders.length, 2, 'Two riders in /riders');

            riders.map(function(rider) {
                test.assert(expectedRiders.has(JSON.stringify(rider)), rider.name + ' in /riders');
            });
        });

        casper.thenOpen(baseUrl + '/races', function() {
            var expectedRaces = new Set([
                '{"name":"Gouden Pijl Emmen","date":"2016-08-11","category":"criterium","report":"verslag"}',
                '{"name":"Ronde van de Lier","date":"2016-08-11","category":"criterium","report":"verslag"}'
            ]);

            var races = JSON.parse(this.getPlainText());
            test.assertEquals(races.length, 2, 'Two races in /races');

            races.map(function(race) {
                test.assert(expectedRaces.has(JSON.stringify(race)), race.name + ' in /races');
            });
        });

        casper.thenOpen(baseUrl + '/races/2016-08-11/ronde-van-de-lier', function() {
            test.assertEquals(this.getPlainText(), 
                              '{"name":"Ronde van de Lier","date":"2016-08-11","category":"criterium","report":"verslag"}',
                             '/races/2016-08-11/ronde-van-de-lier');
                              this.getCurrentUrl().replace(baseUrl, '');
        });

        casper.thenOpen(baseUrl + '/riders/michiel', function() {
            test.assertEquals(this.getPlainText(), 
                              '{"name":"Michiel"}',
                             '/riders/michiel');
                              this.getCurrentUrl().replace(baseUrl, '');
        });

        casper.thenOpen(baseUrl + '/results/michiel/2016-08-11/ronde-van-de-lier', function() {
            test.assertEquals(this.getPlainText(), 
                              '21',
                              this.getCurrentUrl().replace(baseUrl, ''));
        });

        casper.thenOpen(baseUrl + '/results/michiel', function() {
            var me = this;
            var expectedResults = new Set([
                '{"result":"21","race":{"name":"Ronde van de Lier","slug":"ronde-van-de-lier","date":"2016-08-11"}}'
            ]);

            var results = JSON.parse(this.getPlainText());
            test.assertEquals(results.length, 1, 'One result in /results/michiel');
            
            results.map(function(result) {
                test.assert(expectedResults.has(JSON.stringify(result)), me.getCurrentUrl().replace(baseUrl, ''));
            });
        });

       casper.thenOpen(baseUrl + '/results/henk', function() {
            var me = this;
            var expectedResults = new Set([
                '{"result":"31","race":{"name":"Gouden Pijl Emmen","slug":"gouden-pijl-emmen","date":"2016-08-11"}}'
            ]);

            var results = JSON.parse(this.getPlainText());
            test.assertEquals(results.length, 1, 'One result in /results/henk');
            
            results.map(function(result) {
                test.assert(expectedResults.has(JSON.stringify(result)), me.getCurrentUrl().replace(baseUrl, ''));
            });
        });

       casper.thenOpen(baseUrl + '/results/2016-08-11/ronde-van-de-lier', function() {
            var me = this;
            var expectedResults = new Set([
                '{"result":"21","rider":{"name":"Michiel","slug":"michiel"}}'
            ]);

            var results = JSON.parse(this.getPlainText());
            test.assertEquals(results.length, 1, 'One result in ' + me.getCurrentUrl().replace(baseUrl, ''));
            
            results.map(function(result) {
                test.assert(expectedResults.has(JSON.stringify(result)), me.getCurrentUrl().replace(baseUrl, ''));
            });
        });

       casper.thenOpen(baseUrl + '/results/2016-08-11/gouden-pijl-emmen', function() {
            var me = this;
            var expectedResults = new Set([
                '{"result":"31","rider":{"name":"Henk","slug":"henk"}}'
            ]);

            var results = JSON.parse(this.getPlainText());
            test.assertEquals(results.length, 1, 'One result in ' + me.getCurrentUrl().replace(baseUrl, ''));
            
            results.map(function(result) {
                test.assert(expectedResults.has(JSON.stringify(result)), me.getCurrentUrl().replace(baseUrl, ''));
            });
        });

       casper.thenOpen(baseUrl + '/race', {
           method: 'post',
           data: JSON.stringify({
               'name': 'Tijdelijk Standaard',
               'date':  '2016-09-03',
               'category': 'criterium'
           }),
           headers: {
               'Accept':'application/json',
               'Content-type': 'application/json'
           }
       }, function() {
           test.assertEquals(this.getPlainText(), '{"message":"success","slug":"tijdelijk-standaard","date":"2016-09-03"}', '/race post Tijdelijk Standaard');
       });

       casper.thenOpen(baseUrl + '/rider', {
           method: 'post',
           data: JSON.stringify({
               'name': 'John',
           }),
           headers: {
               'Accept':'application/json',
               'Content-type': 'application/json'
           }
       }, function() {
           test.assertEquals(this.getPlainText(), '{"message":"success","slug":"john"}', '/rider post John');
       });

    }).run(function() {
        test.done();
    });
});
