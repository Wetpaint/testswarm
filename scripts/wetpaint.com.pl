#!/usr/bin/perl -w

my $DEBUG = 0;
# The location of the TestSwarm that you're going to run against, TestSwarm username and authtoken from mysql users table.
my $SWARM = "http://testswarm.wetpaint.me";
my ($sec,$min,$hour,$mday,$mon,$year,$wday,$yday,$isdst) = (localtime);
$mon++;
#$min = 1;
if($min < 10){
        $min = "0$min";
};
#$hour = 12;
my $meridien = ($hour < 12 ? "a":"p");
if($hour > 12){
        $hour = $hour % 12; 
};
my $insert = $hour == 12 && $min == "01" ? "midday ": ($hour == 6 && $min == "01" ? "evening ":"");
my $day = qw(Sun Mon Tue Wed Thu Fri Sat)[$wday];
my $JOB_NAME = "$day$insert run $hour:$min$meridien $mon/$mday";
print "\ncreate job: $JOB_NAME\n" if ( $DEBUG );

# The browsers you wish to run against. Options include:
#  - "all" all available browsers.
#  - "popular" the most popular browser (99%+ of all browsers in use)
#  - "current" the current release of all the major browsers
#  - "gbs" the browsers currently supported in Yahoo's Graded Browser Support
#  - "beta" upcoming alpha/beta of popular browsers
#  - "mobile" the current releases of mobile browsers
#  - "popularbeta" the most popular browser and their upcoming releases
#  - "popularbetamobile" the most popular browser and their upcoming releases and mobile browsers
my $BROWSERS = "all";
my $TEST_DOMAIN = "http://stage.wetpaint.me";
my %TESTS = (
	"Home Page" => "/",
	"Article Page" => "/jersey-shore/articles/sammi--deena-defend-the-situation-hes-not-gay-hes-just-italian--exclusive-"
);

my %props = (
			"state" => "addjob",
			"job_name" => $JOB_NAME,
			"output" => "dump",
			"user" => "jenkins",
			"auth" => "d09ca36b05e8213ec45ca8f65f86079ed215bfa7",
			"max" => 10,
			"browsers" => "all"
);
my @query = ();
while(my ($key, $value) = each %props){
	print "\tset $key=$value\n" if ( $DEBUG );
	push(@query, clean($key) . "=" . clean($value));
};
while(my ($key, $value) = each %TESTS){
	$value = $TEST_DOMAIN . $value;
	print "\tadding suite $key\n" if ( $DEBUG );
	print "\twith url $value\n" if ( $DEBUG );
	push(@query, clean("suites[]") . "=" . clean($key));
	push(@query, clean("urls[]") . "=" . clean($value));
};

print "\n\@query:\n\t" . join("\n\t", @query) . "\n" if ( $DEBUG );
my $job_action = "curl -d '". join("&", @query) . "' $SWARM";
# curl -d 'auth=d09ca36b05e8213ec45ca8f65f86079ed215bfa7&max=10&user=jenkins&job%5Fname=Mon%20run%203%3A45p%202%2F13&browsers=all&output=dump&state=addjob&suites%5B%5D=Article%20Page&urls%5B%5D=http%3A%2F%2Fstage%2Ewetpaint%2Eme%2Fjersey%2Dshore%2Farticles%2Fsammi%2D%2Ddeena%2Ddefend%2Dthe%2Dsituation%2Dhes%2Dnot%2Dgay%2Dhes%2Djust%2Ditalian%2D%2Dexclusive%2D&suites%5B%5D=Home%20Page&urls%5B%5D=http%3A%2F%2Fstage%2Ewetpaint%2Eme%2F' http://testswarm.wetpaint.me
# Job submitted: http://testswarm.wetpaint.me/job/9/
print "POST job with command:\n$job_action\n" if ( $DEBUG );
my $results;
$results = `$job_action`;
if ( $results ) {
	print "Job submitted: $SWARM/$results\n" if ( $DEBUG );
} else {
	print "Job not submitted $results\n" if ( $DEBUG );
}

sub clean {
	my $str = shift;
	# escape the text
	$str =~ s/([^A-Za-z0-9])/sprintf("%%%02X", ord($1))/seg;
	$str;
}
