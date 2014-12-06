package com.ucombinator.needle.java.ast;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import org.eclipse.jdt.core.dom.AST;
import org.eclipse.jdt.core.dom.ASTNode;
import org.eclipse.jdt.core.dom.ASTParser;
import org.eclipse.jdt.core.dom.ASTVisitor;
import org.eclipse.jdt.core.dom.AnonymousClassDeclaration;
import org.eclipse.jdt.core.dom.CompilationUnit;
import org.eclipse.jdt.core.dom.ITypeBinding;
import org.eclipse.jdt.core.dom.ImportDeclaration;
import org.eclipse.jdt.core.dom.MethodDeclaration;
import org.eclipse.jdt.core.dom.AbstractTypeDeclaration;
import org.eclipse.jdt.core.dom.Name;
import org.eclipse.jdt.core.dom.SimpleName;
import org.eclipse.jdt.core.dom.SingleVariableDeclaration;
import org.eclipse.jdt.core.dom.Type;
import org.eclipse.jdt.core.dom.TypeDeclaration;
import org.eclipse.jdt.core.dom.VariableDeclarationFragment;

import com.google.common.collect.Collections2;
import com.google.common.collect.Lists;
import com.google.common.base.Function;
 
public class Main {
	private static final Map<String, String> pkgs = new HashMap<String, String>();
	private static Set<String> typesWithoutPkg = new HashSet<String>();
	private static FileWriter outWriter;
	
	static {
		pkgs.put("String",  "java.lang.");
		pkgs.put("Object", "java.lang.");
		pkgs.put("int", "");
		pkgs.put("byte", "");
		pkgs.put("char", "");
		pkgs.put("long", "");
		pkgs.put("boolean", "");
		pkgs.put("double", "");
		pkgs.put("byte", "");
		pkgs.put("char", "");
		pkgs.put("int", "");
		pkgs.put("void", "");
		pkgs.put("InputStream", "java.io.");
		pkgs.put("Collection", "java.util."); 
		pkgs.put("GeneralSubtrees", "java.util.");
		pkgs.put("CRLReason", "java.security.cert.");
		pkgs.put("Class", "java.lang.");
		pkgs.put("Builder", "java.security.KeyStore.");
		pkgs.put("Exception", "java.lang.");
		pkgs.put("Reader", "java.io.");
		pkgs.put("Type", "java.security.KeyRep.");
		pkgs.put("GrantEntry", "javax.crypto.CryptoPolicyParser.");
		pkgs.put("Integer", "java.lang.");
		pkgs.put("Reason", "java.security.cert.CertPathValidatorException.");
		pkgs.put("ClassLoader", "java.lang.");
		pkgs.put("KeyStore.ProtectionParameter", "java.security.");
		pkgs.put("CryptoPermissionEntry", "javax.crypto.CryptoPolicyParser.");
		pkgs.put("Implementation", "javax.crypto.JCEUtil.");
		pkgs.put("LinkedHashSet", "java.util.");
		pkgs.put("File", "java.io.");
		pkgs.put("ProviderProperty", "java.security.Security.");
		pkgs.put("KeyStore.Entry", "java.security.");
		pkgs.put("Transform", "javax.crypto.Cipher.");
		pkgs.put("Throwable", "java.lang.");
		pkgs.put("LoadStoreParameter", "java.security.KeyStore");
		pkgs.put("Policy.Parameters", "java.security.");
		pkgs.put("ProtectionParameter", "java.security.KeyStore.");
		pkgs.put("KeyStore.LoadStoreParameter", "java.security.");
		pkgs.put("ObjectStreamClass", "unknown.package.");
	}
	
	//use ASTParse to parse string
	public static void getPackage(String str, final Map<String, String> typeToPkg) {
		ASTParser parser = ASTParser.newParser(AST.JLS3);
		parser.setSource(str.toCharArray());
		parser.setResolveBindings(true);
		parser.setBindingsRecovery(true);
		parser.setKind(ASTParser.K_COMPILATION_UNIT);
		//parser.setEnvironment(classpath, sources, new String[] { "UTF-8" }, false);

		final CompilationUnit cu = (CompilationUnit) parser.createAST(null);
		
		final Name pkg = cu.getPackage().getName();
		//System.out.println(pkg);
		
		for (ImportDeclaration i : (List<ImportDeclaration>) cu.imports()) {
			String name = i.getName().toString();
			String[] parts = name.split("\\.");
			//System.out.println(name);
			pkgs.put(parts[parts.length-1], 
				String.join(".", Arrays.copyOfRange(parts, 0, parts.length-1)) + ".");
		}
		
		cu.accept(new ASTVisitor() {
			public boolean visit(TypeDeclaration td) {
			  String name = td.getName().toString();
			  //System.out.println(name);
			  pkgs.put(name, pkg.toString() + ".");
			  return false;
			}
		});
	}
	
	private static String prependPkg(String type) {
		type = type.replace("? extends ", "");
		String typePrefix = type.split("[<\\[]")[0];
		if (!pkgs.containsKey(typePrefix)) {
			typesWithoutPkg.add(type + " (tested prefix: " + typePrefix + ")");
		}
		return pkgs.containsKey(typePrefix) ? pkgs.get(typePrefix) + type : type;
	}
	
	//use ASTParse to parse string
	public static void parse(String str) {
		ASTParser parser = ASTParser.newParser(AST.JLS3);
		parser.setSource(str.toCharArray());
		parser.setResolveBindings(true);
		parser.setBindingsRecovery(true);
		parser.setKind(ASTParser.K_COMPILATION_UNIT);
		//parser.setEnvironment(classpath, sources, new String[] { "UTF-8" }, false);

		final CompilationUnit cu = (CompilationUnit) parser.createAST(null);
		final Name pkg = cu.getPackage().getName();
		
		cu.accept(new ASTVisitor() {
			public boolean visit(MethodDeclaration md) {
				if (md.getParent()instanceof AbstractTypeDeclaration) {
					SimpleName className = ((AbstractTypeDeclaration)(md.getParent())).getName();
					SimpleName methodName = md.getName();
					Type ret = md.getReturnType2();
					List<String> paramTypes = Lists.transform(((List<SingleVariableDeclaration>)md.parameters()),
						new Function<SingleVariableDeclaration, String> () {
							public String apply(SingleVariableDeclaration param) {
								return prependPkg(param.getType().toString());
							}
						});
					String method = "<" + pkg + "." + className + ":" +
						(ret != null ? " " + prependPkg(ret.toString()) : "") + " " + methodName + "(" + 
							String.join(",", paramTypes) + ")>";
				    if (isSink(md)) {
				    	output(method + " _SINK_\n");
				    }
				    if (isSource(md)) {
				    	output(method + " _SOURCE_\n");
				    }	
				}
						//"(...) @ " + cu.getLineNumber(md.getStartPosition()));
				return false; // do not continue 
			}
		});
 
	}
	
	private static boolean isSource(MethodDeclaration md) {
		return md.getReturnType2() != null && !"void".equals(md.getReturnType2().toString());
	}

	private static boolean isSink(MethodDeclaration md) {
		return md.parameters().size() > 0;
	}
 
	//read file content into a string
	public static String readFileToString(String filePath) throws IOException {
		StringBuilder fileData = new StringBuilder(1000);
		BufferedReader reader = new BufferedReader(new FileReader(filePath));
 
		char[] buf = new char[10];
		int numRead = 0;
		while ((numRead = reader.read(buf)) != -1) {
			String readData = String.valueOf(buf, 0, numRead);
			fileData.append(readData);
			buf = new char[1024];
		}
 
		reader.close();
 
		return  fileData.toString();	
	}
    interface FileTask extends Runnable {
    	public Runnable setFilename(String filename);
    }
	
    class ParseJavaFileTask implements FileTask {
        private String filename;
        public Runnable setFilename(String filename) { this.filename = filename; return this; }
        public void run() {
        	try {
				parse(readFileToString(filename));
			} catch (IOException e) {
				e.printStackTrace();
			}
        }
    }
    
    class GetPkgTask implements FileTask {
        private Map<String, String> pkgs;
		private String filename;
		public GetPkgTask(Map<String, String> pkgs) {
        	this.pkgs = pkgs;
        }
        public Runnable setFilename(String filename) { this.filename = filename; return this; }
        
        public void run() {
        	try {
				getPackage(readFileToString(filename), this.pkgs);
			} catch (IOException e) {
				e.printStackTrace();
			}
        }
    }
    
    // borrowed from: ?
	class Filewalker {

        public void walk( String path, FileTask task) {

            File root = new File( path );
            File[] list = root.listFiles();

            if (list == null) return;

            for ( File f : list ) {
                if ( f.isDirectory() ) {
                    //System.out.println( "Dir:" + f.getAbsoluteFile() );
                	walk( f.getAbsolutePath(), task );
                }
                else if (f.getName().endsWith("java")) {
                	//System.out.println(f.getAbsolutePath());
                	task.setFilename(f.getAbsolutePath()).run();
                }
            }
        }
    }
	 
	public static void output(String s) {
		try {
			outWriter.write(s);
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
	public static void main(String[] args) throws IOException {
		String outfile = "out/CryptoSourcesAndSinks.txt";
		System.out.println("Outputs to: " + outfile);
		File out = new File(outfile);
		out.createNewFile();
		outWriter = new FileWriter(out);
		
		Main m = new Main();

		m.new Filewalker().walk("../java_crypto_source_code/", m.new GetPkgTask(pkgs));
	    m.new Filewalker().walk("../java_crypto_source_code/", m.new ParseJavaFileTask());
	    System.out.println("unknown packages:");
	    for (String type : typesWithoutPkg) {
	    	System.out.println(type);
	    }
	    outWriter.close();
	    System.out.println("END");
	}
}