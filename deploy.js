var ghpages = require('gh-pages');

// gh-pages seems to be using --global user.email
// https://github.com/tschaub/gh-pages/issues/13
var gitconfig = require('gitconfig');
gitconfig.get({
    location: 'local'
}).then(function (config) {
    ghpages.publish('dist', {
        user: config.user
    });
});

