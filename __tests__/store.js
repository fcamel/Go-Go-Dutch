import FileStore, { runInTestMode } from '../src/store';

runInTestMode();

let gStore = new FileStore();

test('export full expenses as a CSV', () => {
  gStore.init();
  let expected = `\
"","","三眼怪","","","吉吉","","","小小兵","",""
"","費用","應付","已付","差額","應付","已付","差額","應付","已付","差額"
"飯店","5000","2000","0","-2000","1000","0","-1000","2000","5000","3000"
"租車","2000","1000","2000","1000","","","","1000","0","-1000"
"午餐","1000","","","","500","800","300","500","200","-300"`;
  let actual = gStore.exportFullAsCSV(1);

  expect(actual).toMatch(expected);
});
