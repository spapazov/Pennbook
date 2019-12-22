package edu.upenn.nets212.project;

import org.apache.hadoop.io.DoubleWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Reducer;
import org.apache.hadoop.mapreduce.Reducer.Context;

public class DiffSortReducer extends Reducer<DoubleWritable, Text, Text, Text> {
	
	//output <negated_diff_in_labelWeightss, node>
	//output <diff_in_labelWeightss, node> **sorted in descending order in file
	@Override
	public void reduce(DoubleWritable key, Iterable<Text> values, Context context) throws java.io.IOException, InterruptedException {
		
		//key = negated difference in labelWeights
		//value = node
		
		for (Text value: values) {
			String node = value.toString();
			String diff = key.toString();
			
			//removes the first character which is the negative sign
			diff = diff.substring(1);
		    
			context.write(new Text(diff), new Text(node));
		}
	}

}
