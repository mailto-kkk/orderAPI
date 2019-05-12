This API supports version based keys.
Basic Authentication is implemented and the corresponding keys are configured in a file named by config\authorizationConfig.json. 
It supports more than one key. Later these keys will be used for multi tenant architecure
DB details are configured in config\config.json. Currently MYSQL is used as DB. 
If we want to change DB, we need to just change the corresponding node module.(As all SQL queries are written in ANSI standard,
there is no change in application side)
