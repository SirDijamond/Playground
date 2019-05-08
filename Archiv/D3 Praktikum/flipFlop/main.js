var i = 0;
while (i <= 99) {
  i += 1;
  randInt = Math.floor(Math.random() * 100) + 1;
  if (randInt % 2 != 0) {
    document.write('<br/><div style="text-align:center;color:Tomato;">flop');
  } else {
    document.write(
      '<br/><div style="text-align:center;color:DodgerBlue;">flip'
    );
  }
  document.write(" Zahl: " + randInt + " i=" + i + "</div>");
}
