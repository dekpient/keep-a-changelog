const Release = require('./Release');
const Semver = require('semver');

class Changelog {
    constructor(title, description = '') {
        this.title = title;
        this.description = description;
        this.footer = null;
        this.url = null;
        this.releases = [];
    }

    addRelease(release) {
        if (!(release instanceof Release)) {
            throw new Error('Invalid release. Must be an instance of Release');
        }

        this.releases.push(release);
        this.sortReleases();
        release.changelog = this;

        return this;
    }

    findRelease(version) {
        if (!version) {
            return this.releases.find(release => !release.version);
        }
        return this.releases.find(
            release => release.version && Semver.eq(release.version, version)
        );
    }

    sortReleases() {
        this.releases.sort((a, b) => a.compare(b));
    }

    toString() {
        const t = [`# ${this.title}`];

        const links = [];
        const compareLinks = [];

        const description =
            this.description.trim() ||
            `All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/) 
and this project adheres to [Semantic Versioning](http://semver.org/).`;

        if (description) {
            t.push('');
            t.push(description);
        }

        this.releases.forEach(release => {
            t.push('');
            t.push(release.toString(this));

            release.getLinks(this).forEach(link => {
                if (!links.includes(link)) {
                    links.push(link);
                }
            });

            const link = release.getCompareLink(this);

            if (link) {
                compareLinks.push(link);
            }
        });

        if (links.length) {
            t.push('');
            links.sort();
            links.forEach(link => t.push(link));
        }

        if (compareLinks.length) {
            t.push('');

            compareLinks.forEach(link => t.push(link));
        }

        t.push('');

        if (this.footer) {
            t.push('---');
            t.push('');
            t.push(this.footer);
            t.push('');
        }

        return t.join('\n');
    }
}

module.exports = Changelog;
