Ideas:
- What genres most listened to (per year, month, day of the week?)
- When listened to artist for first time

To export LastFM data: https://lastfm.ghan.nl/export/
Music DB: https://musicbrainz.org/doc/MusicBrainz_Identifier
Music DB Schema: https://wiki.musicbrainz.org/-/images/5/52/ngs.png

Get data:
- Artist: https://musicbrainz.org/ws/2/artist/a0cef17a-4574-44f4-9f97-fd068615dac6?fmt=json&inc=tags
- Album: https://musicbrainz.org/ws/2/release/431e522e-7098-4a28-b250-82e6ab3e3785?fmt=json&inc=tags


https://docs.microsoft.com/en-us/windows/wsl/install-win10
https://github.com/metabrainz/musicbrainz-docker
https://itnext.io/using-node-js-to-read-really-really-large-files-pt-1-d2057fe76b33 (event-stream)
https://stackoverflow.com/a/23695940/1223588 (ook event-stream)

https://github.com/metabrainz/musicbrainz-server/blob/962c5c01e64988b8197eb6ea1325bec6af69ff7f/admin/sql/CreateTables.sql


track (0dc2dc49-1fb0-4571-a762-944f2b0679b9) -> recording (16295638)
track (0dc2dc49-1fb0-4571-a762-944f2b0679b9) -> medium (1781941) -> release (1686270)

Performance with searching through files using NodeJS: 
600 tracks = > 10 minutes processing

Performance with SQL:
600 tracks = 2.22 seconds


SQL Performance
- Bulk insert artist (389.937 rows) 1:33.71

### Techniques
- Using [Bull](https://www.npmjs.com/package/bull) as queueing mechanism (makes use of Redis)
- Using [mssql](https://www.npmjs.com/package/mssql) for inserting MusicBrainz data into MsSql
- Using [@elastic/elasticsearch](https://www.npmjs.com/package/@elastic/elasticsearch) to easily query data from Elastic and import LastFM data to it

### Fetching MusicBrainz data
- ~~Try using WSL in order to run MusicBrainz server (which only runs on Linux), failed to get it to work~~
- ~~Find data by using createReadStream and return the items searched for. 600 tracks > 10 minutes of processing time~~
- Putting data into SQL database so fetching data is quick and data relations maintain
    - ~~Inserting data using NodeJS and bulk insert all data at once (took 1:33.71 for 389.937 rows (artist db))~~
    - Inserting data using NodeJS and bulk insert per 1000 (took 0:36.54 for 389.937 rows (artist db))
- Ran into MsSql 10GB DB limit. Switched to MySql


### Processing times
#### Inserting 217.400 tracks into Elasticsearch
- Without memory caching: 786 tracks in 10 seconds
- With artist and album memory caching: 1134 tracks in 10 seconds
- With artist, album and track memory caching: 1536 tracks in 10 seconds