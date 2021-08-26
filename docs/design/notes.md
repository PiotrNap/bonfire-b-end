> The JWT must be sent to the server to access protected routes, and it is typically sent as an Authorization header. The scheme used for this header is Bearer, so the full header looks like this:
```code
Authorization: Bearer <token>
```
> Middleware on the protected API routes will check for a valid JWT, and if there is one, it will let the request through and return the data being requested. Since the user's information is contained within the JWT itself, there is no need to look the user up in a database, so there is less latency in the application.  
A valid JWT gives the user the keys to access data each time a request is made, and in this way, a stateless authentication mechanism is in place.
![Alt text](https://images.ctfassets.net/23aumh6u8s0i/1f37fJAPR7UgfFW8oYYeKs/5f00a4413b04510ad6bd6801f04a2fed/legacy-app-auth-2)
