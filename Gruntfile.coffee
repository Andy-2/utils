module.exports = (grunt) ->

	grunt.initConfig
		pkg: grunt.file.readJSON('package.json'),
		watch:
			options:
				dateFormat: (time) ->
					grunt.log.writeln "The watch finished in #{ time }ms at#{ new Date().toString() }"
					grunt.log.writeln 'Waiting for more changes...'
			forCoffee:
				files: [
					'<%= pkg.path.src.coffee %>**/*.coffee'
				]
				tasks: ['newer:coffee']
		bowercopy:
			options:
				clean: false	# 默认false。到线上服务器可以改为true
			assets:
				options:
					destPrefix: 'assets'
				files: '<%= pkg.bower.copyfiles %>'
		clean:
			forBower:
				src: '<%= pkg.bower.removefiles %>'
			assets:
				src: ['./assets/']

		coffee:
			root:
				files: [
					expand: true
					cwd: '<%= pkg.path.src.coffee %>'
					src: ['*.coffee']
					dest: '<%= pkg.path.src.js %>'
					ext: '.js'
				]

	# 任务加载
	require('load-grunt-tasks') grunt, scope: 'devDependencies'

	grunt.registerTask 'x-assets', ['clean:assets', 'bowercopy', 'uglify:forBower', 'clean:forBower']
	grunt.registerTask 'x-coffee', ['coffee', 'watch']

	grunt.registerTask 'default', 'x-coffee'


