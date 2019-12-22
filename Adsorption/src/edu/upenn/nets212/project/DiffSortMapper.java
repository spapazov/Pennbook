package edu.upenn.nets212.project;

import java.io.IOException;

import org.apache.hadoop.io.DoubleWritable;
import org.apache.hadoop.io.LongWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Mapper;
import org.apache.hadoop.mapreduce.Mapper.Context;

public class DiffSortMapper extends Mapper<LongWritable, Text, DoubleWritable, Text> {
	
	//negates difference in ranks to allow sorting in descending order by shuffle stage
	//input <node, diff_in_labelWeights)
	//output <negated_diff_in_labelWeightss, node>
	
	@Override
	public void map(LongWritable key, Text value, Context context) throws IOException, InterruptedException {
		String line = value.toString();
		String[] lines = line.split("\t");
		String node = lines[0];
		double diff = Double.parseDouble(lines[1]);
        
        diff *= -1;
        
        context.write(new DoubleWritable(diff), new Text(node));
        
	}	
}
