<style>
.reveal code {
    background: #3f3f3f;
    color: #dcdcdc;
    font-size: 80%;
}
.lb {
  text-align: left;
  font-weight: bold;
}
.ml-48 {
  margin-left: 48px;
}
</style>

# [Twelve Factor Apps](https://12factor.net)

methodology for building software-as-a-service apps

---

## The Twelve Factors

1. Codebase
2. Dependencies
3. Config
4. Backing services
5. Build, release, run
6. Processes

Note:
1. One codebase tracked in revision control, many deploys
2. Explicitly declare and isolate dependencies
3. Store config in the environment
4. Treat backing services as attached resources
5. Strictly separate build and run stages
6. Execute the app as one or more stateless processes

----

## The Twelve Factors

<ol start=7>
    <li>Port binding</li>
    <li>Concurrency</li>
    <li>Disposability</li>
    <li>Dev/prod parity</li>
    <li>Logs</li>
    <li>Admin processes</li>
</ol>

Note:
<ol start=7>
    <li> Export services via port binding </li>
    <li> Scale out via the process model </li>
    <li> Maximize robustness with fast startup and graceful shutdown </li>
    <li> Keep development, staging, and production as similar as possible </li>
    <li> Treat logs as event streams </li>
    <li> Run admin/management tasks as one-off processes </li>
</ol>

---

## 1. Codebase
- code is tracked in a version control system (e.g. Git)
- codebase is single repository
- one codebase per app
- multiple apps share code via libraries

----

A deploy is a running instance of the app

![codebase deploys](img/codebase-deploys.png) <!-- .element: style="filter: invert(87%); border: none; box-shadow: none;" -->

Note: 
- codebase is the same across all deploys
- different versions may be active in each deploy

---

## 2. Dependencies

- explicitly declare and isolate dependencies
- never rely on implicit existence of system-wide packages

Note:
- ensure that no implicit dependencies “leak in” from the surrounding system
- system-wide packages:
  - ImageMagick
  - curl
- use package manager
  - JS: npm vs. yarn
  - PHP: composer

----

### NPM vs. YARN

- NPM is not 100 percent deterministic
    - different versions might be installed on another computer (even if you use NPM shrinkwrap)
- Yarn was built to be deterministic, reliable, and fast
    - VCS: add `package.json` and `yarn.lock`, ignore `node_modules`

Note:
- yarn von Facebook, Exponent, Google und Tilde
- npm package.loock bisher nicht zuverlässig genug
- yarn schneller

---

## 3. Config

- Resource handles to the database, Memcached, and other backing services
- Credentials to external services such as Amazon S3 or Twitter
- Per-deploy values such as the canonical hostname for the deploy

----

### Config vs. Code

- strict separation of config from code
- config varies substantially across deploys, code does not

Note:
- don't store config as constants in the code

----

### Configuration Files

Disadvantages:  <!-- .element: class="lb" -->
- easy to mistakenly check in to the repo
- tendency to be scattered about in
  - different places
  - different formats

----

### Environment Variables

store config in environment variables  <!-- .element: class="lb" -->
- easy to change between deploys without changing any code
- not accidentally checked into repo
- language- and OS-agnostic standard
- don't name after specific deploys

Note:
- no defaults?
- documentation of required env vars
- security: [Environment Variables Considered Harmful for Your Secrets](http://movingfast.io/articles/environment-variables-considered-harmful/)

----

#### [Environment Variables Considered Harmful for Your Secrets](http://movingfast.io/articles/environment-variables-considered-harmful/)

> When you store your secret keys in the environment, you are still prone to accidentally expose them -- exactly what we want to avoid.

Note:
- child process by default inherits a copy of all environment variables (called the environment) from its parent process
- your secret keys are implicitly made available to any 3rd-party tools you're using (like ImageMagick to resize an image)

----

### Docker Secrets
```
docker secret create [OPTIONS] SECRET [file|-]
```

- stored in the encrypted Swarm Raft log
- replicated among Swarm hosts
- mounted as read-only tmpfs volume `/run/secrets/`

```
docker exec <container_id> cat /run/secrets/<secret-name>
```
----

#### Grant Access To A Secret

docker-compose.yml <!-- .element: class="lb" style="width: 90%; margin: 20px auto;" -->

```yaml
version: "3.1"
services:
  <service_name>:
    <...>
    secrets:
      - <secret-name>
    <...>
secrets:
  <secret-name>:
   external: true
```

----

### [Vault](https://www.vaultproject.io/) – a secret store

- stores credentials encrypted
- provision credentials dynamically
- completely free and open source
- orchestrator independent

---

## 4. Backing services

![attach resources](img/attached-resources.png) <!-- .element: style="filter: invert(87%); border: none; box-shadow: none;" -->

Note:
- no distinction between local and third party services

---

## 5. Build, release, run


![stages](img/release.png) <!-- .element: style="filter: invert(87%); border: none; box-shadow: none;" -->

strict separation between stages:  <!-- .element: class="lb" -->
1. **build** = code repo converted into executable bundle
2. **release** = build + config
3. **run** release in the execution environment

Note:
- strict separation between the build, release, and run stages
1. **build**:
    - using a version of the code at a commit specified by the deployment process
    - fetch vendors dependencies
    - compile binaries and assets
    - do not run on production server!
2. **release**: ready for immediate execution in the execution environment
3. **run**:
    - also known as "runtime"
    - launch some set of the app’s processes against a selected release

----

### Releases

- every release has a unique ID
- any change must create a new release

Note:
- impossible to make changes to the code at runtime
- a release cannot be mutated once it is created

----

### Docker

- **Build:** Defined in *Dockerfile* and created by
  ```
  docker build --tag name:version .
  ```
  <!-- .element: style="width: 100%;" -->

- **Release:** Defined in *docker-compose.yml*

- **Run:**
  ```
  docker-compose up name
  ```
  <!-- .element: style="width: 100%;" -->
  or  
  ```
  docker stack deploy -c docker-compose.yml name
  ```
  <!-- .element: style="width: 100%;" -->

---

## 6. Processes
- app is executed in the execution environment as one or more processes
- processes are stateless and share-nothing
- persist data using stateful backing service (DB)
- memory space or filesystem as brief, single-transaction cache

Note:
- memory space or filesystem of the process can be used as a brief, single-transaction cache
    1. downloading a large file
    2. operating on it
    3. storing the results of the operation in the database
- never assume that anything cached in memory or on disk will be available on a future request or job
- future request might be served by a different process
- restart might relocate process to a different physical location
- session state data: datastore that offers time-expiration, such as Memcached or Redis.

---

## 7. Port binding

- app is completely self-contained
- export services via port binding
- app can become the backing service for another app

Note:
- no runtime injection of a webserver (Apache HTTPD, Tomcat) into the execution environment
- web app exports HTTP as a service by binding to a port


---

## 8. Concurrency
- scale out via the process model
- processes are a first class citizen
- app must be able to span multiple processes running on multiple physical machines

Note:
- handle diverse workloads according to process type
    - HTTP requests handled by a web process
    - long-running background tasks handled by a worker process
- own internal multiplexing (via threads) is allowed
- never daemonize or write PID files
- rely on OS process manager (e.g. systemd) to manage output streams, respond to crashed processes, and handle user-initiated restarts and shutdowns.

---

## 9. Disposability

- fast startup and shutdown
- shut down gracefully when receiving a [SIGTERM](http://en.wikipedia.org/wiki/SIGTERM)
    - refuse new requests
    - allow current requests to finish

Note:
- maximize robustness with fast startup and graceful shutdown
- processes can be started or stopped at a moment’s notice. 
- implicit: HTTP requests are short (no more than a few seconds)
- long polling: client should seamlessly attempt to reconnect when the connection is lost

----

### [Crash Only Software](https://lwn.net/Articles/191059/)

Stop = Crash Safely  
Start = Recover Fast

---

## 10. Dev/prod parity

|                                | Traditional      | 12-factor
| ------------------------------ | ---------------- | --------------------------
| Time between deploys           | Weeks            | Hours
| Code authors vs code deployers | Different people | Same people
| Dev vs. production environments | Divergent        | As similar as possible

Note:
> Keep development, staging, and production as similar as possible

---

## 11. Logs

- treat logs as event streams
- write unbuffered to `stdout`
- execution env. completely manages streams 

Note:
- Logs have no fixed beginning or end, but flow continuously as long as the app is operating
- A twelve-factor app never concerns itself with routing or storage of its output stream.
- route to file, watch via realtime tail in a terminal.

----

### Logging Tools

- log routers: [Logplex](https://github.com/heroku/logplex), [Fluentd](https://www.fluentd.org/)
- log indexing and analysis system: [Splunk](https://www.splunk.com)
- general-purpose data warehousing system: [Hadoop/Hive](https://hive.apache.org/)
- [ELK-Stack](https://logz.io/learn/complete-guide-elk-stack/) ([Elasticsearch](https://www.elastic.co/products/elasticsearch), [Logstash](https://www.elastic.co/products/logstash), and [Kibana](https://www.elastic.co/products/kibana))

Note:

Introspection:
- Finding specific events in the past
- Large-scale graphing of trends (such as requests per minute)
- Active alerting according to user-defined heuristics

---

## 12. Admin processes

#### one-off administrative or maintenance tasks
- database migrations
- console to run arbitrary code
- one-time scripts committed into the app’s repo

----

### How to run admin process

- identical environment
- run against a release
- use the same codebase and config

Note:
- use the same dependencies (e.g. interpreter (Node.js, Python, etc.))

----

#### Run Admin Process in Docker container

- In General
```bash
docker exec [OPTIONS] CONTAINER COMMAND [ARG...]
```

- Run MongoDB client on admin database in service container `db` in deployed stack `app`.
```bash
docker exec --interactive --tty \
    app_db.1.$(docker service ps -f 'name=app_db.1' app_db -q) \
    mongo admin
```

- Run JavaScript file from host (sent on stdin)
```bash
cat script.js | docker exec --interactive ${CONTAINER} mongo --quiet
```


---

## Should I use microservices?
  
> any decent answer to an interesting question begins, "it depends..."  
> (Kent Beck)

Note:
- is a microservice architecture a good choice for the system you're working on?

----
  
### When you use microservices you have to work on
- automated deployment
- monitoring
- dealing with failure
- eventual consistency
- other factors that a distributed system introduces

----

![productivity: microservices vs. monolith](img/productivity.png) <!-- .element: style="width: calc(95% - 200px);" -->

----

> don't even consider microservices unless you have a system that's too complex to manage as a monolith

[Martin Fowler](https://martinfowler.com/bliki/MicroservicePremium.html)

---

The End.

---

## Bonus

----

### Monitoring

- [Grafana](https://grafana.com/)
- [Prometheus](https://prometheus.io/)
