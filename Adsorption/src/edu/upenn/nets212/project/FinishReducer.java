package edu.upenn.nets212.project;

import java.text.DecimalFormat;

import org.apache.hadoop.io.DoubleWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Reducer;
import org.apache.hadoop.mapreduce.Reducer.Context;

public class FinishReducer extends Reducer<Text, Text, Text, Text> {
	
	@Override
	public void reduce(Text key, Iterable<Text> values, Context context) throws java.io.IOException, InterruptedException {
		
		
		for (Text value: values) {
			String node = key.toString();
			String labels = value.toString();
			
		    
			context.write(new Text(node), new Text(labels));
		}
		
	}

}
