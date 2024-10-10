# code is law
![Alt text](https://avatars.githubusercontent.com/u/45433868?v=4)
### Getting Started

The easiest way to manage node versions is with a version manager such as `nvm`.  
We leave it to the developer to install `nvm` or implement another method which can access the `.nvmrc`.  

```code
cd conex && 
nvm use &&
yarn
```

Do you have docker installed?

You may need to edit `src/scripts/start-db.sh` depending on your operating system.

![Alt text](https://4.bp.blogspot.com/-iy-_fn5n-ZI/V2IVw34C8YI/AAAAAAAAlHE/tXUlW2AYnqYwVgsjKikqqu8SvnGoKxMtwCLcB/s1600/may-the-force-be-with-you.JPG)


### Generating the schema and migration  

This only needs to be done when updates to the typeorm configurations occur.

```code
yarn typeorm:migration:generate -- init  # init can be any migration name
yarn typeorm:migration:run
```  

### Run it!  

```code
yarn dev
```

### Resources 

[https://danielkummer.github.io/git-flow-cheatsheet/](https://danielkummer.github.io/git-flow-cheatsheet/)
