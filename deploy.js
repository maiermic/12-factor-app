var ghpages = require('gh-pages');

ghpages.publish(process.cwd(), {
    user: {
        name: "Michael Maier",
        email: "maier1michael@gmail.com"
    }
});