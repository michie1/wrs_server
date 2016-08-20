casper.test.begin('WRS API', 7, function(test) {
    casper.start('http://localhost:8080', function() {
        casper.then(function() {
            test.assertEquals(this.getPlainText(), '{"message":"wrs api"}', '/');
        });

        casper.thenOpen('http://localhost:8080/setupTest', function() {
            test.assertEquals(this.getPlainText(), 
                              '{"message":"setupTest"}', 
                              '/setupTest');
        });

        casper.thenOpen('http://localhost:8080/riders', function() {
            test.assertEquals(this.getPlainText(), 
                              '[{"name":"Henk"},{"name":"Michiel"}]',
                              '/riders');
        });

        casper.thenOpen('http://localhost:8080/races', function() {
            test.assertEquals(this.getPlainText(), 
                              '[{"name":"Gouden Pijl Emmen","date":"2016-08-11","type":"criterium","report":"verslag"},{"name":"Ronde van de Lier","date":"2016-08-11","type":"criterium","report":"verslag"}]', 
                              '/races');
        });

        casper.thenOpen('http://localhost:8080/races/2016-08-11/ronde-van-de-lier', function() {
            test.assertEquals(this.getPlainText(), 
                              '{"name":"Ronde van de Lier","date":"2016-08-11","type":"criterium","report":"verslag"}',
                             '/races/2016-08-11/ronde-van-de-lier');
        });

        casper.thenOpen('http://localhost:8080/riders/michiel', function() {
            test.assertEquals(this.getPlainText(), 
                              '{"name":"Michiel"}',
                             '/riders/michiel');
        });

        casper.thenOpen('http://localhost:8080/results/michiel/2016-08-11/ronde-van-de-lier', function() {
            test.assertEquals(this.getPlainText(), 
                              '12',
                             '/results/michiel/2016-08-11/ronde-van-de-lier');
        });

    }).run(function() {
        test.done();
    });
});
