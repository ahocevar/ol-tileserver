# ol-tileserver

Simple tile server that creates image tiles from a Mapbox/MapLibre style.

[![DigitalOcean Referral Badge](https://web-platforms.sfo2.cdn.digitaloceanspaces.com/WWW/Badge%201.svg)](https://www.digitalocean.com/?refcode=33a800fe5b21&utm_campaign=Referral_Invite&utm_medium=Referral_Program&utm_source=badge)

## Getting Started

The `Dockerfile` in the root of the app provides the whole server, use `docker build` to build it.

If you want do deploy it on a server immediately, you can click the button below to deploy the app to the DigitalOcean App Platform. If you don't have a DigitalOcean account yet, you can use this [referral link](https://m.do.co/c/33a800fe5b21) to get a 200$ credit over 60 days. See [Deploying the app](./README.md#deploying-the-app) for details.

Once you have deployed the server to `SERVER_URL`, you can start using the server. Example:

    SERVER_URL/tiles/4/8/5.png?style=https://basemaps.arcgis.com/arcgis/rest/services/OpenStreetMap_v2/VectorTileServer/resources/styles/root.json

This will load a Mapbox/MapLibre style from https://arcgis.com/, and display a 512x512 png tile with the tile coordinate z=4, x=8, y=5.

## Server API

The server provides a single endpoint:

    /tiles/:z/:x/:y.:format?style=https://server/providing/a/maplibre-or-mapbox-style.json

Returned tiles will always be 512x512 pixels in a standard Web Mercator tile grid.

*Parameters*:

* `z`: zoom level (0-22)
* `x`: tile column
* `y`: tile row
* `format`: one of `png`, `jpg`, `jpeg`, `webp`


### Requirements

* You need a DigitalOcean account. If you don't already have one, you can sign up at https://cloud.digitalocean.com/registrations/new.

## Deploying the App

**Note: Following the steps below may result in charges for the use of DigitalOcean services.**

Click this button to deploy the app to the DigitalOcean App Platform. If you are not logged in, you will be prompted to log in with your DigitalOcean account.

[![Deploy to DigitalOcean](https://www.deploytodo.com/do-btn-blue.svg)](https://cloud.digitalocean.com/apps/new?repo=https://github.com/ahocevar/ol-tileserver/tree/main)

Using this button disables the ability to automatically re-deploy your app when pushing to a branch or tag in your repository as you are using this repo directly.

If you want to automatically re-deploy your app, [fork](https://docs.github.com/en/github/getting-started-with-github/fork-a-repo) the GitHub repository to your account so that you have a copy of it stored to the cloud. Click the **Fork** button in the GitHub repository and follow the on-screen instructions.

After forking the repo, you should now be viewing this README in your own GitHub org (e.g. `https://github.com/<your-org>/ol-tileserver`). To deploy the new repo, visit https://cloud.digitalocean.com/apps and click **Create App**. Then, click **GitHub**, select the repository you created and select the `main` branch. App Platform will inspect the code, automatically detect the kind of component to create, and use the correct buildpack to create and deploy a container.

After clicking the **Deploy to DigitalOcean** button or completing the instructions above to fork the repo, follow these steps:

1. Configure the app such as specifying HTTP routes, environment variables or adding a database.
1. Provide a name for your app and select which region you want to deploy your app to and click **Next**. The closest region to you should be selected by default. All App Platform apps are routed through a global CDN. So this will not affect your app performance, unless it needs to talk to external services.
1. On the following screen, leave all the fields as they are and click **Next**.
1. Confirm your **Plan** settings and how many containers you want to launch and click **Launch Basic/Pro App**.
1. You should see a "Building..." progress indicator. You can click **View Logs** to see more details of the build.
1. It can take a few minutes for the build to finish, but you can follow the progress in the **Deployments** tab.
1. Once the build completes successfully, click the **Live App** link in the header and you should see your running application in a new tab, displaying the home page.

