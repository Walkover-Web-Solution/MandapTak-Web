1.System Setup

MacOSX and Linux : 
Write a command in terminal : curl -s https://www.parse.com/downloads/cloud_code/installer.sh | sudo /bin/bash
This will install parse in your system
	

Windows :

Download parse.exe file from here : https://github.com/ParsePlatform/parse-cli/releases/tag/release_2.2.8
Now copy parse.exe to C:/Windows/system32 folder
Now search for command prompt and run it as administrator
Go to c:/Windows/SysWoW64 in cmd
	
Now write a code to get your js files
	 parse new
it will ask for your email address and password which you used to sign in to parse.com
then press e
then press 1 (to select MandapTakDev)
	
Now once you have done this now you can see a folder in c:/Windows/SysWOW64/MandapTak 
where you can change code in your files
	
To upload files to parse server 
in cmd at c:/Windows/SysWOW64/MandapTak write - parse deploy

2.Creating Web App
in cmd at c:/Windows/SysWOW64/MandapTak write - parse generate

This command creates the following directory structure inside your cloud folder. It will not touch your existing main.js file.
-cloud/
  app.js
  -views/
    hello.ejs
  main.js (not touched)
  
  
Next, you need to add the following line at the top of your main.js. This makes sure that the code in app.js is loaded.

require('cloud/app.js');


Link to refer: https://www.parse.com/docs/cloudcode/guide#hosting-dynamic-websites

To Initializa Parse object ,include this line :

<script src='https://www.parsecdn.com/js/parse-1.2.18.min.js'></script>

3.To make web app live:

-> go to "hosting" section by clicking on "Setting"
-> give your parse app a name.
-> type url "ur-parse-app-name".parseapp.com 

4. Making a simple web app
step1:
in main.js , write this code: 

Parse.Cloud.define("hello", function(request, response) {
  response.success("Hello world!");
  // You need to include response.success/error in Cloud Code indicating the end of the request, or the codes will went wrong.
});

How to call above function and where?
in public/index.html write this code in <body> section:

<script type="text/javascript">
  
    // After installing the Parse SDK above, intialize it with your Parse application ID and key below
    Parse.initialize("$PARSE_APPLICATION_ID", "$PARSE_JAVASCRIPT_KEY");
    
	Parse.Cloud.run('hello', {}, {
	  success: function(result) {
		window.alert(result);
		// result is 'Hello world!'
	  },
	  error: function(error) {
	  }
	});
		
</script>

Link to Refer:https://www.parse.com/docs/cloudcode/guide#cloud-code-logging-from-cloud-code

This function will be called as soon as script starts loading. 
If you want this function to execute on an event:
in body section,make a button:
  <button type="submit" onclick="myFunction()">Submit</button>
 <script> 
  function myFunction()
  {
	// After installing the Parse SDK above, intialize it with your Parse application ID and key below
    Parse.initialize("$PARSE_APPLICATION_ID", "$PARSE_JAVASCRIPT_KEY");
    
	Parse.Cloud.run('hello', {}, {
	  success: function(result) {
		window.alert(result);
		// result is 'Hello world!'
	  },
	  error: function(error) {
	  }
	});
  }
</script>


Now Web app prints "Hello World" alert.
You can change/add more functions in main.js and call in the index.html file.
