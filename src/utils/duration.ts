const msToHour = (time: number) => {
  time = Math.round(time / 1000);
  const s = time % 60,
    m = ~~((time / 60) % 60),
    h = ~~(time / 60 / 60);

  return h === 0
    ? `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${String(Math.abs(h) % 24).padStart(2, "0")}:${String(m).padStart(
        2,
        "0"
      )}:${String(s).padStart(2, "0")}`;
};

export {msToHour};