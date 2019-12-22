package edu.upenn.nets212.project;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URI;

import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.FSDataInputStream;
import org.apache.hadoop.fs.FileStatus;
import org.apache.hadoop.fs.FileSystem;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.io.DoubleWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Job;
import org.apache.hadoop.mapreduce.lib.input.FileInputFormat;
import org.apache.hadoop.mapreduce.lib.input.TextInputFormat;
import org.apache.hadoop.mapreduce.lib.output.FileOutputFormat;
import org.apache.hadoop.mapreduce.lib.output.TextOutputFormat;


public class RecommendationsDriver 
{
  public static void main(String[] args) throws Exception {
	
	//used to run readDiffResults from command line
	//Usage: GeocodeDriver readDiff <fileToRead>
	if (args[0].equals("readDiff")) {
		System.out.println(readDiffResult(args[1]));
	}
	
	//insufficient command line arguments
	else if (args.length < 3) {
        System.err.println("Usage1: RecommendationsDriver init <inputDir> <outputDir> <#reducers>\n"
        		+ "Usage2: RecommendationsDriver iter <inputDir> <outputDir> <#reducers>\n"
        		+ "Usage3: RecommendationsDriver diff <inputDir1> <inputDir2> <outputDir> <#reducers>\n"
        		+ "Usage4: RecommendationsDriver finish <inputDir> <outputDir> <#reducers>\n"
        		+ "Usage5: RecommendationsDriver composite <inputDir> <outputDir> <intermDir1> <intermDir2> <diffDir> <#reducers>");
        System.exit(-1);
      }
    
    String command = args[0];
    
    if (command.equals("init")) {
    	if (args.length == 4) {
    		String inputDir = args[1];
    		String outputDir = args[2];
    		int noReducers = Integer.parseInt(args[3]);
    		
    		initDriver(inputDir, outputDir, noReducers);
    	}
    }
    else if (command.equals("iter")) {
    	if (args.length == 4) {
    		String inputDir = args[1];
    		String outputDir = args[2];
    		int noReducers = Integer.parseInt(args[3]);
    		
    		iterDriver(inputDir, outputDir, noReducers);
    	}
    }
    else if (command.equals("diff")) {
    	if (args.length == 5) {
    		String inputDir1 = args[1];
    		String inputDir2 = args[2];
    		String outputDir = args[3];
    		int noReducers = Integer.parseInt(args[4]);
    		
    		diffDriver(inputDir1, inputDir2, outputDir, noReducers);
    	}
    }
    else if (command.equals("finish")) {
    	if (args.length == 4) {
    		String inputDir = args[1];
    		String outputDir = args[2];
    		int noReducers = Integer.parseInt(args[3]);
    		
    		finishDriver(inputDir, outputDir, noReducers);
    	}
    }
    else if (command.equals("composite")) {
    	if (args.length == 7) {
    		String inputDir = args[1];
    		String outputDir = args[2];
    		String intermDir1 = args[3];
    		String intermDir2 = args[4];
    		String diffDir = args[5];
    		int noReducers = Integer.parseInt(args[6]);
    		
    		composite(inputDir, outputDir, intermDir1, intermDir2, diffDir, noReducers);
    	}
    }
    //wrong command entered
    else {
    	System.err.println("Usage1: RecommendationsDriver init <inputDir> <outputDir> <#reducers>\n"
        		+ "Usage2: RecommendationsDriver iter <inputDir> <outputDir> <#reducers>\n"
        		+ "Usage3: RecommendationsDriver diff <inputDir1> <inputDir2> <outputDir> <#reducers>\n"
        		+ "Usage4: RecommendationsDriver finish <inputDir> <outputDir> <#reducers>\n"
        		+ "Usage5: RecommendationsDriver composite <inputDir> <outputDir> <intermDir1> <intermDir2> <diffDir> <#reducers>");
        System.exit(-1);
    }
  }
  
  public static void initDriver(String inputDir, String outputDir, int noReducers) throws IllegalArgumentException, IOException, ClassNotFoundException, InterruptedException {
	    
	  	System.out.println("PennBook");
	  	
	    Job initJob = new Job();
	    
	    initJob.setJarByClass(RecommendationsDriver.class);
	    
	    // Set the paths to the input and output directory
	    FileInputFormat.addInputPath(initJob, new Path(inputDir));
	    FileOutputFormat.setOutputPath(initJob, new Path(outputDir));
	    
	    // Set the Mapper and Reducer classes
	    initJob.setMapperClass(InitMapper.class);
	    initJob.setReducerClass(InitReducer.class);
	    
	    //set the number of reduces for the job
	    initJob.setNumReduceTasks(noReducers);
	    
	    // Set the output types of the Mapper class
	    // <?, ?>
	    initJob.setMapOutputKeyClass(Text.class);
	    initJob.setMapOutputValueClass(Text.class);
	    
	    // Set the output types of the Reducer class
	    // <?, ?>
	    initJob.setOutputKeyClass(Text.class);
	    initJob.setOutputValueClass(Text.class);
	    
	    initJob.setInputFormatClass(TextInputFormat.class);
	    initJob.setOutputFormatClass(TextOutputFormat.class);
	    
	    // Delete output directory if exists
		try {
			deleteDirectory(outputDir);
		} catch (Exception e) {
			System.err.println("Existing output directory cannot be deleted!");
		}
	    
	    System.out.println(initJob.waitForCompletion(true) ? 0 : 1);
  }
  
  public static void iterDriver(String inputDir, String outputDir, int noReducers) throws IllegalArgumentException, IOException, ClassNotFoundException, InterruptedException {
	    
	  	System.out.println("PennBook");
	  	
	  	Configuration cf=new Configuration();
	    Job iterJob = Job.getInstance(cf);              
	    
	    iterJob.setJarByClass(RecommendationsDriver.class);
	    
	    // Set the paths to the input and output directory
	    FileInputFormat.addInputPath(iterJob, new Path(inputDir));
	    FileOutputFormat.setOutputPath(iterJob, new Path(outputDir));
	    
	    // Set the Mapper and Reducer classes
	    iterJob.setMapperClass(IterMapper.class);
	    iterJob.setReducerClass(IterReducer.class);
	    
	  //set the number of reduces for the job
	    iterJob.setNumReduceTasks(noReducers);
	    
	    // Set the output types of the Mapper class
	    // <outboundNodes, propogateValue>
	    iterJob.setMapOutputKeyClass(Text.class);
	    iterJob.setMapOutputValueClass(Text.class);
	    
	    // Set the output types of the Reducer class
	    // <outboundNodes, newRankandOutboundNodes>
	    iterJob.setOutputKeyClass(Text.class);
	    iterJob.setOutputValueClass(Text.class);
	    
	    iterJob.setInputFormatClass(TextInputFormat.class);
	    iterJob.setOutputFormatClass(TextOutputFormat.class);
	    
	    // Delete output directory if exists
		try {
			deleteDirectory(outputDir);
		} catch (Exception e) {
			System.err.println("Existing output directory cannot be deleted!");
		}
	    
	    System.out.println(iterJob.waitForCompletion(true) ? 0 : 1);
	
	 
}
  
  public static void diffDriver(String inputDir1, String inputDir2, String outputDir, int noReducers) throws IllegalArgumentException, IOException, ClassNotFoundException, InterruptedException {
	    
	  	System.out.println("PennBook");
	  	
	  	String intermediateDir = "rAndOmtEmpFiLe";
	  	
	    Job diffJob = new Job();
	    
	    diffJob.setJarByClass(RecommendationsDriver.class);
	    
	    // Set the paths to the input and output directory
	    FileInputFormat.setInputPaths(diffJob, new Path(inputDir1),new Path(inputDir2));
	    FileOutputFormat.setOutputPath(diffJob, new Path(intermediateDir));
	    
	    // Set the Mapper and Reducer classes
	    diffJob.setMapperClass(DiffMapper.class);
	    diffJob.setReducerClass(DiffReducer.class);
	    
	    //set the number of reduces for the job
	    diffJob.setNumReduceTasks(noReducers);
	    
	    // Set the output types of the Mapper class
	    // <node, rank>
	    diffJob.setMapOutputKeyClass(Text.class);
	    diffJob.setMapOutputValueClass(Text.class);
	    
	    // Set the output types of the Reducer class
	    // <node, difference_in_rank>
	    diffJob.setOutputKeyClass(Text.class);
	    diffJob.setOutputValueClass(Text.class);
	    
	    diffJob.setInputFormatClass(TextInputFormat.class);
	    diffJob.setOutputFormatClass(TextOutputFormat.class);
	    
	    //Delete output directory if exists
 		try {
 			deleteDirectory(intermediateDir);
 		} catch (Exception e) {
 			System.err.println("Existing output directory cannot be deleted!");
 		}
	 		
	    System.out.println(diffJob.waitForCompletion(true) ? 0 : 1);
	    
	    Job diffSortJob = new Job();
	    
	    diffSortJob.setJarByClass(RecommendationsDriver.class);
	    
	    // Set the paths to the input and output directory
	    FileInputFormat.setInputPaths(diffSortJob, new Path(intermediateDir));
	    FileOutputFormat.setOutputPath(diffSortJob, new Path(outputDir));
	    
	    // Set the Mapper and Reducer classes
	    diffSortJob.setMapperClass(DiffSortMapper.class);
	    diffSortJob.setReducerClass(DiffSortReducer.class);
	    
	    //set the number of reduces for the job
	    diffSortJob.setNumReduceTasks(noReducers);
	    
	    // Set the output types of the Mapper class
	    // <node, difference_in_rank>
	    diffSortJob.setMapOutputKeyClass(DoubleWritable.class);
	    diffSortJob.setMapOutputValueClass(Text.class);
	    
	    // Set the output types of the Reducer class
	    // <node, sorted_difference_in_rank>
	    diffSortJob.setOutputKeyClass(Text.class);
	    diffSortJob.setOutputValueClass(Text.class);
	    
	    diffSortJob.setInputFormatClass(TextInputFormat.class);
	    diffSortJob.setOutputFormatClass(TextOutputFormat.class);
	    
	    // Delete output directory if exists
		try {
			deleteDirectory(outputDir);
		} catch (Exception e) {
			System.err.println("Existing output directory cannot be deleted!");
		}
		
		System.out.println(diffSortJob.waitForCompletion(true) ? 0 : 1);
}
  
  public static void finishDriver(String inputDir, String outputDir, int noReducers) throws IllegalArgumentException, IOException, ClassNotFoundException, InterruptedException {
	    
	  	System.out.println("PennBook");
	  	
	    Job finishJob = new Job();
	    
	    finishJob.setJarByClass(RecommendationsDriver.class);
	    
	    // Set the paths to the input and output directory
	    FileInputFormat.addInputPath(finishJob, new Path(inputDir));
	    FileOutputFormat.setOutputPath(finishJob, new Path(outputDir));
	    
	    // Set the Mapper and Reducer classes
	    finishJob.setMapperClass(FinishMapper.class);
	    finishJob.setReducerClass(FinishReducer.class);
	    
	  //set the number of reduces for the job
	    finishJob.setNumReduceTasks(noReducers);
	    
	    // Set the output types of the Mapper class
	    // <?, ?>
	    finishJob.setMapOutputKeyClass(Text.class);
	    finishJob.setMapOutputValueClass(Text.class);
	    
	    // Set the output types of the Reducer class
	    // <?, ?>
	    finishJob.setOutputKeyClass(Text.class);
	    finishJob.setOutputValueClass(Text.class);
	    
	    finishJob.setInputFormatClass(TextInputFormat.class);
	    finishJob.setOutputFormatClass(TextOutputFormat.class);
	    
	    // Delete output directory if exists
		try {
			deleteDirectory(outputDir);
		} catch (Exception e) {
			System.err.println("Existing output directory cannot be deleted!");
		}
		
	    System.out.println(finishJob.waitForCompletion(true) ? 0 : 1);
}
  
  public static void composite(String inputDir, String outputDir, String intermDir1, String intermDir2, String diffDir, int noReducers) throws Exception {
	  initDriver(inputDir, intermDir1, noReducers);
	  iterDriver(intermDir1, intermDir2, noReducers);
	  iterDriver(intermDir2, intermDir1, noReducers);
	  
	  diffDriver(intermDir1, intermDir2, diffDir, 1);
	  
	  while (readDiffResult(diffDir) > 0.002) {
		  System.out.println(readDiffResult(diffDir));
		  
		  iterDriver(intermDir1, intermDir2, noReducers);
		  iterDriver(intermDir2, intermDir1, noReducers);
		  iterDriver(intermDir1, intermDir2, noReducers);
		  iterDriver(intermDir2, intermDir1, noReducers);
		  
		  diffDriver(intermDir1, intermDir2, diffDir, 1);
	  }
	  
	  finishDriver(intermDir1, outputDir, noReducers);
	  
	  
  }
  

  // Given an output folder, returns the first double from the first part-r-00000 file
  static double readDiffResult(String path) throws Exception 
  {
    double diffnum = 0.0;
    Path diffpath = new Path(path);
    Configuration conf = new Configuration();
    FileSystem fs = FileSystem.get(URI.create(path),conf);
    
    if (fs.exists(diffpath)) {
      FileStatus[] ls = fs.listStatus(diffpath);
      for (FileStatus file : ls) {
	if (file.getPath().getName().startsWith("part-r-00000")) {
	  FSDataInputStream diffin = fs.open(file.getPath());
	  BufferedReader d = new BufferedReader(new InputStreamReader(diffin));
	  String diffcontent = d.readLine();
	  
	  //for debugging
	  String diff = diffcontent.split("\t")[0];
	  
	  diffnum = Double.parseDouble(diff);
	  d.close();
	}
      }
    }
    
    fs.close();
    return diffnum;
  }

  static void deleteDirectory(String path) throws Exception {
    Path todelete = new Path(path);
    Configuration conf = new Configuration();
    FileSystem fs = FileSystem.get(URI.create(path),conf);
    
    if (fs.exists(todelete)) 
      fs.delete(todelete, true);
      
    fs.close();
  }

}
