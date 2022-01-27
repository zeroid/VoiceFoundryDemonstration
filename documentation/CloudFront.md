# Cloud Front

## Overview

The Cloud Front distribution serves the [web client](WebClient.md) UI from the [S3 bucket](S3.md), and the REST API from [API Gateway](ApiGateway.md). It exposes both through a common endpoint. The Cloud Front distribution is currently configured with no caching for development but can easily be reconfigured to cache both the UI and API.