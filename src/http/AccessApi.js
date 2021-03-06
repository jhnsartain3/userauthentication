import apiStrings from "../assets/apiStrings";

let baseUrl;

class AccessApi {
    constructor(apiName) {

        this.determineWhichConnectionStringToUse(apiName);
    }

    determineWhichConnectionStringToUse(apiName) {
        let result = apiStrings.find(apiString => {
            return apiString.name === apiName
        });

        let parentLocation = this.getParentLocation();

        if (this.isRunningAsIframe()
            && (parentLocation.includes('test.sartainstudios.com') || parentLocation.includes('localhost')))
            baseUrl = result.test
        else if (this.isRunningAsIframe())
            baseUrl = result.production
        else
            baseUrl = this.getSelfLocation().includes("localhost")
                ? result.development
                : window.location.href.includes("test.sartainstudios.com")
                    ? result.test
                    : result.production;
    }

    isRunningAsIframe() {
        return document.location.ancestorOrigins[0] !== null && document.location.ancestorOrigins[0] !== undefined
    }

    getParentLocation() {
        return document.location.ancestorOrigins[0]
    }

    getSelfLocation() {
        return window.location.href
    }

    getData(urlExtension, data) {
        let completeUrl = baseUrl + urlExtension;

        if (data != null)
            completeUrl = completeUrl + "";

        return this.fetch(completeUrl)
    }

    postData(urlExtension, data) {
        const completeUrl = baseUrl + urlExtension;

        const httpMethod = 'POST';

        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        };

        const body = JSON.stringify(data);

        const options = {method: httpMethod, headers: headers, body: body};

        return this.fetch(completeUrl, options)
    }

    fetch(completeUrl, options) {
        return new Promise(function (resolve) {
                fetch(completeUrl, options)
                    .then(res => res.json())
                    .then((result) => {
                            return resolve(result)
                        },
                        (error) => {
                            return resolve(error)
                        });
            }
        )
    }
}

export default AccessApi;