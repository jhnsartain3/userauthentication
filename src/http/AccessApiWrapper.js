import AccessAPI from "./AccessApi";

class AccessApiWrapper extends AccessAPI {
    getData(item) {
        return super.getData(item);
    }

    postData(urlExtension, data) {
        return super.postData(urlExtension, data);
    }
}

export default AccessApiWrapper;
