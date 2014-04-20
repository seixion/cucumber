module.exports = function(grunt) {

    require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);

    grunt.initConfig({

        project: {
            root: __dirname.split("/").pop()
        },

        sass: {
            dev: {
                options: {
                    style: "expanded"
                },
                files: {
                    "css/style.css": "css/style.scss"
                }
            },
            dist: {
                options: {
                    style: "compressed"
                },
                files: {
                    "css/style.css": "css/style.scss"
                }
            }
        },

        rsync: {
            options: {
                //args: ["--verbose"],
                exclude: [".git*", "*.scss*", "node_modules*", "*.sublime-project*", "*.sublime-workspace*", ".svn*", "package.json", "GruntFile.js"],
                recursive: true
            },
            dev: {
                options: {
                    src: "./",
                    dest: "/Users/geveritt/www/<%= project.root %>/"
                }
            }
        },

        requirejs: {
            compile: {
                options: {
                    baseUrl: "js/src",
                    mainConfigFile: "js/src/requireConfig.js",
                    name: "requireConfig",
                    out: "js/bin/app-compiled.js"
                }
            }
        }


    });
    
    grunt.registerTask("default", [
        "sass:dev",
        "rsync:dev"
    ]);

    grunt.registerTask("production", [
        "sass:dist",
        "requirejs:compile",
        "rsync:dev"
    ]);

};