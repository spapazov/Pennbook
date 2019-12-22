package edu.upenn.nets212.project;

import java.io.IOException;

import org.apache.hadoop.io.LongWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Mapper;
import org.apache.hadoop.mapreduce.Mapper.Context;

public class InitMapper extends Mapper<LongWritable, Text, Text, Text> {
	
	@Override
	public void map(LongWritable key, Text value, Context context) throws IOException, InterruptedException {
		
		
		String edge = value.toString();
		String[] edgeList = edge.split("\t");
		String node1 = edgeList[0];
		String node2 = edgeList[1];
		
		//<node, singleOutboundNode>
		context.write(new Text(node1), new Text(node2));
		
		//user - att relationship is not symmetric
		//need to create att - user edge so labels can be propogated out of attributes
		if(node2.startsWith("(")) {
			context.write(new Text(node2), new Text(node1));
		}
		
		
	}
}
