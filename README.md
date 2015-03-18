needle README

#Instructions:

##install nodejs

get nodejs for your platform from http://nodejs.org/

follow nodejs install instructions.

##clone needle repo

git clone git@github.com:camsoupa/needle.git

##get node package dependencies for needle (FYI, these are specified in package.json - all nodejs apps follow this system)
$ cd needle && npm install

##put preprocessed android apps in needle/data/apps

Needle currently builds its own callgraph and risk report in tapas-like fashion.

All you need to do is run [apk2s](https://github.com/38/dex2sex/blob/master/script/apk2s) (and optionally some sort of dataflow analysis) and put the source code, AndroidManifest, apk2s  results and dataflow results in the right folders.  (The callgraph is currently generated at runtime from the dex2sex results.)

So this is currently a manual process but should be automated:

(1) Copy app source and manifest into needle/data/apps/source/appname/

(2) Copy app apk2s results into needle/data/apps/compiled/appname/

(3) Copy dataflow paths file (.ss) into needle/data/apps/sourcesinks/appname.ss

To be more specific, the folder structure is like this:
```
needle/

    data/ 

        source_list  <--contains flow-droid sources plus more

        sink_list      <--contains flow-droid sinks plus more

        apps/

            source/  <--contains source code for android app

                appname/

                    src/my/package/name/SomeClass.java

                    AndroidManifest.xml

            compiled/    <-- contains the results of dex2sex (perhaps decompiled would be more clear)

                appname/

                    src/my/package/name/SomeClass.sddx

            sourcesinks/ <--contains dataflows for apps (optional)

                 appname.ss
```
The source sink files (.ss) represent a list of flow paths.  Each node in each path has a className, statement and line number.  The format is: ```(((className stmt line) ... ) ... )```, for example:

```( ( ("my.package.OuterClass$InnerClass.java" "r3 = 42 + 1"  121) ... ) ... )```

The first node in a flow path is the source and the last node in a flow path is the sink.

##start needle server
$ node server

##browse to localhost:3000 (or port specified by node server output)




