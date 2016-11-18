# Count-Everything
This project provides a simple secured quantitative query through multiple institutions. Project website: http://counteverything.ucsd-dbmi.org/. 

## Overview

Count Everything enables users to pose a secure and anonymous count query across three BD2K centers (MD2K, PIC-SURE, and CBDTG) based on homomorphic encryption (HME); it then divides the query into domain-specific parts and sends them to the corresponding center. Each center provides partial query results corresponding to their domain; the system then uses secure computation models to return the results back to the users without compromising privacy. 

## User guide

### Set up environmnet
install PHP/JAVA Bridge. Reference: http://dasunhegoda.com/access-java-function-php-phpjava-bridge/560/

java implement of HME. Reference:  https://github.com/achenfengb/CountEverything
### System workflow
<p align="center">
  <img src="https://github.com/chao92/Count-Everything/blob/master/workflow.png">
</p>


## Demo Video
<a href="https://www.youtube.com/watch?v=tkOnAIJjJWw
" target="_blank"><img src="https://github.com/chao92/Count-Everything/blob/master/Screen%20Shot%202016-11-18%20at%2010.52.51%20AM.png" 
alt="IMAGE ALT TEXT HERE" width="550" height="300" border="10" /></a>

## For more information
