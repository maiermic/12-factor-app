var ghpages = require('gh-pages');

var gitconfig = require('gitconfig');
gitconfig.get({
    location: 'local'
}).then(function (config) {
    ghpages.publish(process.cwd(), {
        user: config.user
    });
});

