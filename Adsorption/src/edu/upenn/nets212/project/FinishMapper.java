package edu.upenn.nets212.project;

import java.io.IOException;

import org.apache.hadoop.io.DoubleWritable;
import org.apache.hadoop.io.LongWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Mapper;
import org.apache.hadoop.mapreduce.Mapper.Context;

public class FinishMapper extends Mapper<LongWritable, Text, Text, Text> {
	
	//remove adjacency list
	//input <node, "label:labelWeights ; outboundNodes:weight separated by spaces">
	
	//negates ranks to allow sorting in descending order by shuffle stage
	//output <negatedRank, node>
	
	@Override
	public void map(LongWritable key, Text value, Context context) throws IOException, InterruptedException {
		
		String line = value.toString();
		String[] lines = line.split("\t");
        String node = lines[0];
        String labelOutboundNodesWeight = lines[1];
        String labels = labelOutboundNodesWeight.split(";")[0];
        
        if (!node.startsWith("(")){
        	System.out.println(node + ", " + labels);
        	context.write(new Text(node), new Text(labels));
        }
	}

}
