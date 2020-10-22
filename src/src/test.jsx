import React from "./React";
const list = [
  {
    id: 1,
    name: `name1`
  },
  {
    id: 11,
    name: `name2`
  },
  {
    id: 12,
    name: `name3`
  },
  {
    id: 13,
    name: `name4`
  }
];

function foo(items) {
  return items.map(p => <li> {p.name} </li>);
}

const divList = (
  <div id="foo">
    <p>Look, a simple JSX DOM renderer!</p>
    <ul>{foo(list)}</ul>
  </div>
);
export default divList;
