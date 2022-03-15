Demo Application (Node JS) 
Software:
	Visual Studio Code (IDE)
Node JS installer
Dependencies:
Module Name	Version
cookie-parser	1.4.6
cors	2.8.5
express	4.17.3
express-session	1.17.2
fs	0.0.1-security
hbs	4.2.0
uuid	8.3.2
Installing Modules using Node Package Manager (NPM):
NPM comes bundled with Node.js installable after v0.6.3 version.
Note: Before installing any module, initialize npm using ‘npm init’, which will generate package.json
	npm install <Module Name>@<Version>
Uninstalling a Module:
	npm uninstall <Module Name>
Updating a Module:
	npm update <Module Name>

Running the application:
Nodemon is a utility that will monitor for any changes in your source and automatically restart your server. 
Navigate to the root directory of the project and run
   nodemon .\app.js -e js,hbs
The extension –e stands for define file extension. 

Now try to access defined app using URL: http://127.0.0.1:3000/
