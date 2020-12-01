const axios = require("axios");
let CHECKR_API = "https://api.checkr.com/v1";
let CHECKR_PROXY = "https://monday-bgchecks.glitch.me";

module.exports.createCandidate = async (checkrToken, candidate) => {
  let call_options = {
    method: "POST",
    url: `${CHECKR_API}/candidates`,
    auth: {
      username: `${checkrToken}`,
      password: "",
    },
    data: {
      first_name: candidate.first_name,
      last_name: candidate.last_name,
      email: candidate.email,
    },
  };
  let checkr_candidate = await axios(call_options).catch((err) =>
    console.log("err createCandidate", err.data)
  );
  return checkr_candidate.data;
};

module.exports.createInvitation = async (
  checkrToken,
  candidate_id,
  package_slug
) => {
  let call_options = {
    method: "POST",
    url: `${CHECKR_API}/invitations`,
    auth: {
      username: `${checkrToken}`,
      password: "",
    },
    data: {
      candidate_id: candidate_id,
      package: package_slug,
    },
  };
  let invitation = await axios(call_options).catch((err) =>
    console.log("err createInvitation", err)
  );
  return invitation.data;
};

module.exports.getPackages = async (checkrToken, candidate) => {
  let call_options = {
    method: "GET",
    url: `${CHECKR_API}/packages`,
    auth: {
      username: `${checkrToken}`,
      password: "",
    },
  };
  let result = await axios(call_options).catch((err) =>
    console.log("err getPackages", err.data)
  );
  console.log(result);
  return result.data.data;
};

module.exports.getCandidatesByEmail = async (checkrToken, email) => {
  let call_options = {
    method: "GET",
    url: `${CHECKR_PROXY}/checkrproxy`,
    headers: {
      'X-checkr-api-key': checkrToken,
    },
    params: {
      func: "getCandidatesByEmail",
      email,
    },
  };
  let checkr_candidate = await axios(call_options).catch((err) =>
    console.log("err getCandidatesByEmail", err.data)
  );
  return checkr_candidate.data;
};


module.exports.getReportDetails = async (checkrToken, report_id) => {
    let call_options = {
      method: "GET",
      url: `${CHECKR_PROXY}/checkrproxy`,
      headers: {
        'X-checkr-api-key': checkrToken,
      },
      params: {
        func: "getReportDetails",
        report_id,
      },
    };
    let report = await axios(call_options).catch((err) =>
      console.log("err getReportDetails", err.data)
    );
    return report.data;
  };