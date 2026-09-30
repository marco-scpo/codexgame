export function sprite(type, x = 0, y = 0, size = 60) {
  let body = "";
  if (type === "core")
    body =
      '<path fill="#283c36" d="M9 21h8V12h26v9h8v29H9z"/><path fill="#778e83" d="M14 24h32v22H14zM20 15h20v9H20z"/><path fill="#c7d6bc" d="M18 27h24v5H18zM21 36h7v10h-7zM33 36h7v10h-7z"/><path fill="#e1a763" d="M25 8h10v8H25zM28 2h4v7h-4zM27 23h6v7h-6z"/><path fill="#141f1b" d="M17 46h26v5H17z"/>';
  if (type === "reactor")
    body =
      '<path fill="#45554e" d="M27 18h6v30h-6zM19 47h22v4H19z"/><path fill="#557b78" d="M6 12h48v25H6z"/><path fill="#8dc5bd" d="M9 15h42v19H9z"/><path stroke="#416966" stroke-width="2" d="M19 15v19M30 15v19M41 15v19M9 24h42"/><path fill="#d7e4b7" d="M27 38h6v4h-6z"/>';
  if (type === "mine")
    body =
      '<path fill="#535c47" d="M10 39h40v11H10zM17 16h26v26H17z"/><path fill="#bd8d55" d="M20 19h20v23H20z"/><path fill="#ebbc73" d="M25 11h10v13H25zM11 36h38v6H11z"/><path fill="#29392e" d="M23 27h14v10H23z"/><path fill="#efc580" d="M27 28h6v9h-6z"/><path fill="#76816a" d="M10 44h7v8h-7zM43 44h7v8h-7z"/>';
  if (type === "turret")
    body =
      '<path fill="#334f3d" d="M12 35h36v15H12z"/><path fill="#708f72" d="M17 29h26v17H17z"/><path fill="#b2c99a" d="M22 21h16v15H22z"/><path fill="#789b77" d="M26 5h8v21h-8z"/><path fill="#dce8c4" d="M27 4h6v8h-6zM24 24h12v5H24z"/><path fill="#2b4030" d="M12 46h36v6H12z"/><path fill="#e9b564" d="M27 38h6v5h-6z"/>';
  if (type === "wall")
    body =
      '<path fill="#2b352d" d="M5 38h50v15H5z"/><path fill="#697660" d="M7 20h46v25H7z"/><path fill="#9ba488" d="M7 18h46v6H7z"/><path fill="#424b3c" d="M17 24h4v21h-4zM38 24h4v21h-4z"/><path fill="#d2ac65" d="M9 32h6v7H9zM23 32h13v7H23zM44 32h7v7h-7z"/>';
  if (type === "enemy")
    body =
      '<path fill="#4f302e" d="M12 22h36v22H12zM20 13h20v9H20z"/><path fill="#c96f61" d="M16 24h28v15H16zM23 17h14v9H23z"/><path fill="#efb3a0" d="M20 28h7v5h-7zM33 28h7v5h-7z"/><path fill="#8d5148" d="M8 32h8v14H8zM44 32h8v14h-8zM16 42h10v9H16zM34 42h10v9H34z"/>';
  if (type === "mortar")
    body =
      '<path fill="#363e5d" d="M9 38h42v15H9z"/><path fill="#8798bd" d="M14 30h32v17H14z"/><path fill="#b6c5db" d="M19 22h22v16H19z"/><path fill="#7485af" d="m27 9 13 7-8 18-13-7z"/><path fill="#dce8ed" d="m29 6 14 7-3 7-14-7z"/><path fill="#26314b" d="m32 9 8 4-2 4-8-4z"/><path fill="#e8b069" d="M12 43h7v5h-7zM41 43h7v5h-7z"/>';
  if (type === "shield")
    body =
      '<path fill="#29484c" d="M13 44h34v8H13z"/><path fill="#548783" d="M20 33h20v14H20z"/><path fill="#8bd8c7" d="M26 19h8v20h-8z"/><path fill="#c5fff0" d="M22 12h16v12H22z"/><path fill="#65bdb7" d="M26 7h8v9h-8zM17 17h7v4h-7zM36 17h7v4h-7z"/><path stroke="#6acac4" stroke-width="2" opacity=".6" fill="none" d="M12 31V12l18-9 18 9v19M7 35V9L30 0l23 9v26"/>';
  if (type === "relic")
    body =
      '<path fill="#38465a" d="M10 44h40v8H10z"/><path fill="#5d6989" d="M18 20h24v26H18z"/><path fill="#bb9dde" d="M25 12h10v24H25z"/><path fill="#efd2ff" d="M28 7h4v12h-4zM23 23h14v5H23z"/><path fill="#98c3d5" d="M16 34h8v4h-8zM36 34h8v4h-8z"/>';
  if (type === "scout")
    body =
      '<path fill="#643853" d="m7 26 12-8h22l12 8-7 13H14z"/><path fill="#eb82a2" d="M19 20h22v16H19z"/><path fill="#ffe0e7" d="M22 24h6v4h-6zM33 24h6v4h-6z"/><path stroke="#b86585" stroke-width="4" d="m13 31-7 13m12-8-4 13m29-18 7 13m-12-8 4 13"/>';
  if (type === "brute")
    body =
      '<path fill="#6d3a35" d="M7 19h46v28H7zM14 11h32v12H14z"/><path fill="#c07b64" d="M13 22h34v22H13zM19 15h22v14H19z"/><path fill="#e9ad7a" d="M20 24h20v6H20zM6 25h9v18H6zM45 25h9v18h-9z"/><path fill="#ffdfaa" d="M25 25h10v4H25z"/><path fill="#8f5446" d="M10 43h15v11H10zM35 43h15v11H35z"/><path fill="#402d31" d="M17 34h26v7H17z"/>';
  if (type === "siege")
    body =
      '<path fill="#482e55" d="M10 28h40v20H10z"/><path fill="#a177b7" d="M16 23h28v20H16z"/><path fill="#cbb0db" d="M22 14h16v20H22z"/><path fill="#eedaec" d="M25 8h10v12H25z"/><path fill="#6f467e" d="M6 38h11v14H6zM43 38h11v14H43zM17 43h26v8H17z"/><path fill="#ed9fbc" d="M26 29h8v5h-8z"/>';
  if (type === "lander")
    body =
      '<path fill="#3b4761" d="M8 34h44v17H8z"/><path fill="#73859a" d="M15 23h30v22H15zM22 14h16v17H22z"/><path fill="#c5d4d4" d="M23 16h14v8H23zM12 33h8v12h-8zM40 33h8v12h-8z"/><path fill="#e9a25e" d="M8 47h12v7H8zM40 47h12v7H40z"/>';
  return `<g transform="translate(${x} ${y}) scale(${size / 60})" shape-rendering="crispEdges">${body}</g>`;
}
export function miniSprite(type) {
  return `<svg viewBox="0 0 60 60" class="mini-sprite" aria-hidden="true">${sprite(type)}</svg>`;
}
