(function(window) {

    function SjisToUtf8(sjisstr) {
        console.log(Encoding.detect(sjisstr));
        var utf8Array = Encoding.convert(sjisstr, 'UNICODE');
        return utf8Array;
    }


    function loadBinaryData(filepath, cb) {
        var request = new XMLHttpRequest();
        request.open('GET', filepath, true);
        //request.responseType = 'text';
        request.responseType = 'arraybuffer';
        request.onreadystatechange = (function (self) {
            return function () {
                if ((request.readyState === 4 && request.status === 200) ||
                    (request.readyState === 4 && request.status === 0)) {
                    //var res = request.responseText;
                    var res = request.response;
                    if (cb) {
                        cb(res);
                    }
                }
            };
        }(this));
        request.send();
    }


    function csvJSON(csv) {
        csv = SjisToUtf8(new Uint8Array(csv));
        csv = String.fromCharCode.apply(null, new Uint16Array(csv));
        //console.log(csv);
        var lines = csv.split("\n");
        var result = [];
        var headers = lines[0].split(",");
        for(var i = 1;i < lines.length; i++){
            var obj = {};
            var currentline=lines[i].split(",");
            for(var j=0;j<headers.length;j++){
                obj[headers[j]] = currentline[j];
            }
            result.push(obj);
        }
        //console.log(result);
        return result;
    }

    var idx, songdata;
    window.addEventListener('load', function() {
        loadBinaryData('songdata.csv', function (csv) {

            idx = lunr(function () {
                this.use(lunr.multiLanguage('en', 'ja'));
                this.ref('id')
                this.field('artist');
                this.field('song');
                this.field('type');
                this.field('tie-up-contents');
                this.field('key0');
                this.field('key1');
                this.field('key2');
                this.field('key3');
                this.field('key4');
                this.field('key5');
                this.field('key6');
                this.field('key7');
                this.field('key8');
                this.field('key9');
                
                songdata = csvJSON(csv);
                songdata.forEach(function (lunr) {
                    return function (doc) {
                        lunr.add(doc);
                    };
                }(this));
            });
            var result = idx.search('嵐');
            console.log('ret', result);
        });

        var searchword = document.getElementById('searchword'),
            ret = document.getElementById('ret');

        function searchFunc(word) {
            searchword.value = word;
            var result = idx.search(searchword.value);
            resultFunc(result);
        }
        window.searchFunc = searchFunc;

        function resultFunc(result) {
            var resulttxt = '',
                i, j,
                song;

            console.log(result);

            resulttxt = result.length + "件見つかりました。<br>";
            for (i = 0; i < result.length; ++i) {
                song = songdata[result[i].ref - 1];
                resulttxt += song.song + ' - <a href="#" onclick="searchFunc(' + "'" + song.artist + "'" + ');">' + song.artist + '</a>';
                resulttxt += ' | ';
                for (j = 0; j < 10; ++j) {
                    if (song['key' + j] != undefined) {
                        resulttxt += ' <a href="#" onclick="searchFunc(' + "'" + song['key' + j] + "'" + ');">' + song['key' + j] + '</a>';
                    }
                }
                resulttxt += '<br>';

            }
            ret.innerHTML = resulttxt;
        }
        
        searchword.addEventListener('change', function () {
            console.log(idx);
            var result = idx.search("*" + searchword.value + "*");
            resultFunc(result);
        });
        
    });
}(window));