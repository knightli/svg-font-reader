var Path = require('path'),
    fs = require('fs'),
    open = require('open'),
    svg2ttf = require('svg2ttf');

var dir = process.cwd(),
    argv = process.argv;

var filepath = argv[2];
if (!filepath) {
    return usage();
}

run(filepath);

function heredoc(fn) {
    return fn.toString().split('\n').slice(1,-1).join('\n') + '\n'
}

var html = heredoc(function(){/*
<html><head><style>
@font-face {
  font-family: 'iconfont';
  src: url('{filename}.ttf') format('truetype'), url('{filename}.svg') format('svg');
}
i {
    display: block;
    font-family: 'iconfont';
    font-size: 2rem;
    font-style: normal;
    width: 5rem;
    height: 6rem;
    line-height: 6rem;
    text-align: center;
    color: #666;
}
</style>
</head>
<body>
<ul>
{content}
</ul>
</body>*/});

var frag = '<li><xmp>{code}</xmp><i>{code}</i></li>'


function run(filepath) {
    var path = Path.join(dir, filepath);

    if(!fs.existsSync(path)){

        console.log('file not found:'+filepath);
        return;
    }

    // chrome can't support svg?
    // there is some document online said that chrome 6+ support svg font-face
    // but when we use svg only, render failed
    // so we have no choice but to covert svg to ttf
    makettf(path);

    var re = /unicode="([^"]+)"/g;

    fs.readFile(path, 'utf-8', function(e, body) {
        
        var arr = [];
        while(re.exec(body)!=null){
            var str = frag.replace(/{code}/g,RegExp.$1);
            arr.push(str);
        }

        var content = arr.join('');

        var str = html.replace(/{filename}/g,Path.basename(path,'.svg')).replace('{content}',content);

        var htmlFilePath = filepath+'.html';
        fs.writeFileSync(htmlFilePath, str);

        open(htmlFilePath);

    });
    
}

function makettf(svgpath){
    var ttf = svg2ttf(fs.readFileSync(svgpath,'utf-8'), {});
    var path = Path.join(Path.dirname(svgpath), Path.basename(svgpath,'.svg') + '.ttf');
    fs.writeFileSync(path, new Buffer(ttf.buffer));
}

function usage(){
    console.log('usage: svgfr <svgfile>');
}