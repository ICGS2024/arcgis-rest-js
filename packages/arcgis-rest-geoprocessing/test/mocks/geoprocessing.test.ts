import fetchMock from "fetch-mock";
import { GeoprocessingJob } from "../../src/index.js";
import {
  GPJobIdResponse,
  GPEndpointCall,
  mockResults,
  mockHotspot_Raster
} from "./mock-fetches.js";

describe("GeoprocessingJob Class", () => {
  describe("createJob", () => {
    it("should return a jobId", () => {
      fetchMock.mock("*", GPJobIdResponse);
      GeoprocessingJob.createJob(GPEndpointCall).then((job) => {
        expect(job.jobId).toEqual(GPJobIdResponse.jobId);
      });
    });
    it("should trigger startEventMonitioring", () => {
      fetchMock.once("*", { jobStatus: "esriJobSubmitted" });
      fetchMock.once("*", { jobStatus: "esriJobExecuting" });
      fetchMock.once("*", { jobStatus: "esriJobSucceeded" });
      fetchMock.once("*", mockResults);

      GeoprocessingJob.createJob(GPEndpointCall).then((response) => {
        response.startEventMonitoring();
        response.emitter.on("submitted", (result: any) =>
          expect(result).toEqual({ jobStatus: "esriJobSubmitted" })
        );
        response.emitter.on("executed", (result: any) =>
          expect(result).toEqual({ jobStatus: "esriJobExecuting" })
        );
        response.emitter.on("succeeded", (result: any) =>
          expect(result).toEqual({ jobStatus: "esriJobSucceeded" })
        );
      });
    });
    it("should return results once status is succeeded", () => {
      // fetchMock.once("*", mockHotspot_Raster);
      fetchMock.once("*", mockResults);
      GeoprocessingJob.createJob(GPEndpointCall).then((response) => {
        response.startEventMonitoring();
        response.emitter.on("succeeded", (results: any) =>
          expect(results).toEqual(mockResults)
        );
      });
    });
    it("should get specific result property from results", () => {
      fetchMock.once("*", mockHotspot_Raster);
      fetchMock.once("*", mockResults);
      GeoprocessingJob.createJob(GPEndpointCall).then((response) => {
        response.startEventMonitoring();
        response.emitter.on("succeeded", () => {
          console.log(response);
          response
            .getResults("Hotspot_Raster")
            .then((results) => expect(results).toEqual(mockHotspot_Raster));
        });
      });
    });
  });
});
