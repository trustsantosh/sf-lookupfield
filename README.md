# sf-lookupfield (Salesforce LWC Component for Lookup Field)
This repository contains code to have custom lightning lookup with more filters and multi-object support for some fields.
## Apex Class
### 1. SF_ObjectFieldController
    This class contains methods to get metadata info about lookup field and query data using SOSL.
#### a. <code>LookupFieldResult getLookupFieldDetails(String objAPIName, String objFieldAPIName)</code>

#### b. <code>LookupDataResult getLookupResult(String objAPIName, String inputString, List<String> fieldList, String soqlWhereClause)</code>
  
### 2. LWC Components
    LWC Component to show UI and handle User Interaction. It also exposes methods, properties to be used by end-users
#### a. sfCustomLookupField
    Main LWC Component, which render search box and result as per user input.
#### a. sfCustomLookupFieldExample
    LWC Component with embeded example for sfCustomLookupField component with various options
    

