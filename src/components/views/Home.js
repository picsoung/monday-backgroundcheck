import React, { useState, useEffect } from "react";
import "../../App.css";

import {
  createCandidate,
  getCandidatesByEmail,
  getReportDetails,
} from "../../lib/checkr";

import mondaySdk from "monday-sdk-js";
import "monday-ui-react-core/dist/main.css";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import { Box, Text, Button, Heading, Accordion, AccordionPanel, Select, Anchor } from "grommet";
import { ShareRounded } from 'grommet-icons';
import Spinner from "../Spinner"
dayjs.extend(relativeTime);

const monday = mondaySdk();

const Home = ({ setView, user, isTrackingEnabled }) => {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);
  const [isSetupComplete, setSetupComplete] = useState(false);
  const [, setContext] = useState(null);
  const [candidateEmail, setCandidateEmail] = useState("");
  const [candidate, setCandidate] = useState(null);
  const [currentItem, setCurrentItem] = useState(null);
  const [report, setReport] = useState(null);

  useEffect(() => {
    monday.listen("settings", async (res) => {
      setSettings(res.data);
      if (
        res.data.checkr_api_key &&
        res.data.checkr_api_key != "" &&
        res.data.emailcolumn
      ) {
        setSetupComplete(true);
      }
    });
  }, []);

  useEffect(() => {
    if (settings && isSetupComplete) {
      monday.listen("context", (res) => {
        setContext("context", res.data);
        monday
          .api(
            `query ($itemId: [Int]) {
              items (ids:$itemId) {
                  name,
                  id,
                  column_values {
                    id,
                    value
                  }
                }
              }`,
            { variables: { itemId: res.data.itemId } }
          )
          .then((res) => {
            let { items } = res.data;
            let item = items[0];
            setCurrentItem(item);
            let emailColumn = Object.keys(settings.emailcolumn)[0];
            let emailField = item.column_values.filter(
              (c) => c.id === emailColumn
            );
            if (emailField && emailField.length > 0) {
              let email = JSON.parse(emailField[0].value).email;
              setCandidateEmail(email);
            }
          });
      });
    }
  }, [settings, isSetupComplete]);

  useEffect(() => {
    if (candidateEmail && settings) {
      //find report for this email in Checkr
      getCandidates();
    }
  }, [candidateEmail,settings]);

  const getCandidates = async () => {
    let candidates = await getCandidatesByEmail(
      settings.checkr_api_key,
      candidateEmail
    );
    if (candidates && candidates.data && candidates.data.length > 0) {
      //more than one matching candidate
      let candidate = candidates.data[0];
      setCandidate(candidates.data[0]);
      // get subsequent report
      if (candidate.report_ids.length > 0) {
        let report = await getReportDetails(
          settings.checkr_api_key,
          candidate.report_ids[0]
        );
        setReport(report);
      }

      setLoading(false)
    }
  };

  const createCandidate = async (email) => {};

  return (
    <Box fill={true}>
      <Box
        justify="center"
        align="start"
        pad="small"
        direction="column"
        fill={true}
      >
        {loading && (<Spinner/>)}
        {!loading && isSetupComplete && !candidate && (
          <Box>
            <Heading level="2" size="medium">
              Candidate not found
            </Heading>
            <Box>
              <Button
                label="Invite to background check"
                onClick={() => {
                  createCandidate(candidateEmail);
                }}
              />
            </Box>
          </Box>
        )}
        {!loading && isSetupComplete && candidate && report && (
          <Box fill={true}>
            <Box direction="row" align="center">
              <Heading level="2" size="medium">
                {candidate.first_name} {candidate.last_name}
              </Heading>
              <Text
                margin="small"
                color={report.status === "clear" ? "green" : "red"}
              >{report.status}</Text>
              <Anchor icon={<ShareRounded />} href={`https://dashboard.checkr.com/candidates/${candidate.id}?test=true`} target="_blank"/>
            </Box>

            <Box>
              <Heading level="3" size="small">
                Details
              </Heading>
              <Text>Last updated {dayjs(report.completed_at).fromNow()}</Text>
            </Box>
            <Box>
              <Accordion multiple>
                <AccordionPanel
                  label={
                    <>
                    <Text size="medium">SSN Trace</Text>
                    <Text size="small">{dayjs(report.ssn_trace.completed_at).fromNow()}</Text>
                    <Text
                      margin="small"
                      size="small"
                      color={report.ssn_trace.status === "clear" ? "green" : "red"}
                      >{report.ssn_trace.status}</Text>
                  </>
                  }
                >
                </AccordionPanel>
                <AccordionPanel
                  label={
                    <>
                    <Text size="medium">Sex Offender Search</Text>
                    <Text size="small">{dayjs(report.sex_offender_search.completed_at).fromNow()}</Text>
                    <Text
                      margin="small"
                      size="small"
                      color={report.sex_offender_search.status === "clear" ? "green" : "red"}
                      >{report.sex_offender_search.status}</Text>
                  </>
                  }
                >
                <Box background="light-2" height="xsmall">
                  {report.sex_offender_search.records.map((item,index) =>{
                    return <Box key={index}><Text size="small">Registry: {item.registry}</Text><Text size="small">Full name: {item.full_name}</Text></Box>
                  })}
                </Box>
                </AccordionPanel>
                <AccordionPanel 
                  label={
                    <>
                    <Text size="medium">Motor Vehicle Record</Text>
                    <Text size="small">{dayjs(report.motor_vehicle_report.completed_at).fromNow()}</Text>
                    <Text
                      margin="small"
                      size="small"
                      color={report.motor_vehicle_report.status === "clear" ? "green" : "red"}
                      >{report.motor_vehicle_report.status}</Text>
                  </>
                  }>
                  <Box background="light-2">
                    <Text size="small">License Number: {report.motor_vehicle_report.license_number}</Text>
                    <Text size="small">License State: {report.motor_vehicle_report.license_state}</Text>
                    <Text size="small">License Status: {report.motor_vehicle_report.license_status}</Text>
                    <Text size="small">License Type: {report.motor_vehicle_report.license_type}</Text>
                    <Text size="small">Issue date: {report.motor_vehicle_report.issued_date}</Text>
                    <Text size="small">Expiration date: {report.motor_vehicle_report.expiration_date}</Text>
                  </Box>
                </AccordionPanel>
                <AccordionPanel 
                  label={
                    <>
                    <Text size="medium">National Search</Text>
                    <Text size="small">{dayjs(report.national_criminal_search.completed_at).fromNow()}</Text>
                    <Text
                      margin="small"
                      size="small"
                      color={report.national_criminal_search.status === "clear" ? "green" : "red"}
                      >{report.national_criminal_search.status}</Text>
                  </>
                  }>
                </AccordionPanel>
              </Accordion>
            </Box>
          </Box>
        )}
        {!isSetupComplete && (
          <Box background="light-3" round="medium" pad="medium">
            <Heading color="status-error" margin={{ top: "xsmall" }}>
              Oops something went wrong
            </Heading>
            <Text>
              To continue using this app you first need to create a{" "}
              <a href="https://checkr.io">checkr.io</a> account.
            </Text>
            <Text>
              Once you have created you account open the Settings sidebar and
              fill up your details.
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Home;
