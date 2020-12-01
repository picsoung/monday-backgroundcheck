import React, { useState, useEffect } from "react";
import {
  Box,
  TextInput,
  Button,
  CheckBox,
  Text,
} from "grommet";

import styled from "styled-components"

import { Search } from "grommet-icons";
import { mondayTypes } from "../../../utils/mondayToTypeform";
import ColumnIcon from "../../ColumnIcon";
import mondaySdk from "monday-sdk-js";
const monday = mondaySdk();

const View = styled.div`
  display: flex;
  flex-direction: column;
`;

const SearchBox = styled.div`
  display: flex;
`;

const ColumnsSelector = styled.div`
  display: flex;
  max-height: 228px;
  min-height: 228px;
  overflow-y: auto;
  flex-direction: column;
  padding-left: 5px;
`;

const CheckboxWrapper = styled.div`
  padding: 3px 0;
`;

const Filters = styled.div`
  padding-left: 5px;
  padding: 5px
`;

const ColumnSelector = ({ board, onChangeFct, selectedFields, setSelectedFields
  }) => {
  const [, setColumnValue] = useState("");
  const [columnFilter, setColumnFilter] = useState("");

  useEffect(() => {
    monday.storage.instance.setItem(
      "selectedColumns",
      JSON.stringify(selectedFields)
    );
  }, [selectedFields]);

  const addColumn = async (columnId) => {
    let cols = selectedFields.slice();
    cols.push(columnId);
    setSelectedFields(cols);
    onChangeFct(cols)
  };

  const removeColumn = async (columnId) => {
    let cols = selectedFields.filter((c) => c !== columnId)
    setSelectedFields(cols);
    onChangeFct(cols)
  };

  const selectAll = () => {
    const selectedFieldIds = board.columns
      .filter((column) => Object.keys(mondayTypes).includes(column.type))
      .map((column) => column.id);
    setSelectedFields(selectedFieldIds);
  };

  const clearAll = () => {
    setSelectedFields([]);
  };

  return (
    <View>
      <SearchBox>
        <TextInput
          placeholder="Search columns"
          defaultValue=""
          style={{
            backgroundColor: "transparent",
            fontWeight: 400
          }}
          onChange={(e) => {
            setColumnValue(e.target.value);
            setColumnFilter(e.target.value);
          }}
          icon={<Search />}
        />
      </SearchBox>
      <Filters>
        <Box direction="row-responsive" gap="small">
          <Button color="dark-3" onClick={selectAll}>
            <Text size="xsmall">Select all</Text>
          </Button>
          <Button color="dark-3" onClick={clearAll}>
            <Text size="xsmall"> Clear all</Text>
          </Button>
        </Box>
      </Filters>
      <ColumnsRenderer 
        columns={board.columns}
        columnFilter={columnFilter}
        selectedColumns={selectedFields}
        onSelectedColumn={ (columnId) => { 
            selectedFields.includes(columnId)
          ? removeColumn(columnId)
          : addColumn(columnId); }}
      />
    </View>
  );
};

const ColumnsRenderer = ({ columns, columnFilter, onSelectedColumn, selectedColumns }) => {
  
  return (
  <ColumnsSelector>
      {columns
        .filter((f) => {
          if (columnFilter !== "") {
            return f.title.toLowerCase().match(columnFilter.toLowerCase());
          } else {
            return f;
          }
        })
        .map((column, i) => {
          const isSupported = Object.keys(mondayTypes).includes(column.type);
          const props = isSupported
            ? {
                onChange: (e) => { onSelectedColumn(column.id) },
                checked: selectedColumns.includes(column.id),
              }
            : {
                disabled: true,
                checked: false,
              };
          return (
            <CheckboxWrapper key={column.id}>
              <CheckBox
                key={column.id}
                {...props}
                label={
                  <Box direction="row" gap="xsmall" align="center">
                    <ColumnIcon type={column.type} />
                    {column.title}
                    {props.disabled
                      ? props.isMissingOptions
                        ? " (no choices)"
                        : " (not supported)"
                      : ""}
                  </Box>
                }
              />
            </CheckboxWrapper>
          );
        })}
  </ColumnsSelector>
)}

export default ColumnSelector;
