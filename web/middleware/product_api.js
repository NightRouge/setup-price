/*
  The custom REST API to support the app frontend.
  Handlers combine application data from qr-codes-db.js with helpers to merge the Shopify GraphQL Admin API data.
  The Shop is the Shop that the current user belongs to. For example, the shop that is using the app.
  This information is retrieved from the Authorization header, which is decoded from the request.
  The authorization header is added by App Bridge in the frontend code.
*/

import { Shopify } from "@shopify/shopify-api";

export default function applyAPIEndpoints(app){
  app.get("/api/get-collections",async(req,res)=>{
    const session = await Shopify.Utils.loadCurrentSession(
      req,
      res,
      app.get("use-online-tokens")
    );
  
  if(!session){
    res.status(401).send("Could not find a Shopify session");
    return;
  }
  const client = new Shopify.Clients.Graphql(
    session.shop,
    session.accessToken
  );
  const collections = await client.query({
    data:`{
      collection(first: 50){
        edges{
          node{
            id
            title
            handle
            productsCount
          }
        }
      }
    }`,
  });
  res.send(collections.body.data);
  });
  app.get("/api/get-tags",async(req,res) =>{
    const session = await Shopify.Utils.loadCurrentSession(
      req,
      res,
      app.get("use-online-tokens")
    );
    if(!session){
      res.status(401).send("Could not find a Shopify session");
      return;
    }
    const client = new Shopify.Clients.Graphql(
      session.shop,
      session.accessToken
      );
      const tags = await client.query({
        data:`{
          shop{
            productTags(first:50){
              edges{
                cursor
                node
              }
            }
          }
        }`,
      });
      res.send(tags.body.data)
  });
  app.get("/api/get-product-price/:id?",async(req,res)=>{
    const session = await Shopify.Utils.loadCurrentSession(
      req,
      res,
      app.get("use-online-tokens")
    );
    if(!session){
      res.status(401).send("Could not find a Shopify session");
      return;
    }
    const client = new Shopify.Clients.Graphql(
      session.shop,
      session.accessToken
      );
    const tags = await client.query({
      data:`{
        product(id:"${req.query.id}")
      {
        totalVariants
        title
        handle
        priceRangeX2{
          maxVariantPrice{
            amount
          }
        }
      }
    }`,
    });
    res.send(tags.body.data);
  });
  app.get("/api/get-all-product-price",async(req,res)=>{
    const session= await Shopify.Utils.loadCurrentSession(
      req,
      res,
      app.get("use-online-tokens")
    );
    if(!session){
      res.status(401).send("Could not find a Shopify session");
      return;
    }
    const client = new Shopify.Clients.Graphql(
      session.shop,
      session.accessToken
    );
    const result = await client.query({
      data:`{
        products(first: 100){
          edges{
            node{
              priceRangeX2{
                maxVariantPrice{
                  amount
                }
              }
              title
              totalVariants
            }
          }
        }
      }`,
    });
    res.send(result.body.data.products.edges);
  });
  app.get("/api/get-product-by-tag:tags?",async(req,res)=>{
    const session = await Shopify.Utils.loadCurrentSession(
      req,
      res,
      app.get("use-online-tokens")
    );
    if(!session){
      res.status(401).send("Could not find a Shopify session");
      return;
    }
    const client = new Shopify.Clients.Graphql(
      session.shop,
      session.accessToken
    );
    const result = await client.query({
      data:`{
        products(first:100,query:"tag:[${req.query.tags}]"){
          edges{
            node{
              title
              totalVariants
              priceRangeX2{
                maxVariantPrice{
                  amount
                }
              }
            }
          }
        }
      }`,
    });
    res.send(result.body.data.products.edges);
  })
}