# AI Return Format

## 觀念分類格式

```json
{
  "ocrText": "肺泡與微血管之間進行何種作用？",
  "subjectId": "subject_bio",
  "unitId": "unit_bio_02",
  "matchedConceptId": "concept_bio_003",
  "matchedConceptName": "氣體交換",
  "isNewConcept": false,
  "confidence": 0.95,
  "candidateConceptIds": ["concept_bio_002", "concept_bio_003", "concept_bio_004"]
}
```

如果真的沒有對應觀念：

```json
{
  "ocrText": "植物把光能轉成化學能並供細胞利用，這題核心最適合歸在哪個觀念？",
  "subjectId": "subject_bio",
  "unitId": "unit_bio_03",
  "matchedConceptId": "concept_bio_007",
  "matchedConceptName": "能量轉換",
  "isNewConcept": true,
  "confidence": 0.62,
  "candidateConceptIds": ["concept_bio_004", "concept_bio_005", "concept_bio_006"],
  "newConceptReason": "現有觀念無法完整涵蓋 ATP 與能量型態轉換的題型。"
}
```

## 素養題生成格式

```json
{
  "subjectId": "subject_bio",
  "unitId": "unit_bio_02",
  "conceptId": "concept_bio_003",
  "questionStyle": "literacy",
  "title": "登山時的呼吸變化",
  "passage": "小明和家人去爬山，走到半山腰時發現自己呼吸變快，爸爸說這是因為身體需要更多氧氣來維持活動。此時肺部中的肺泡會和周圍微血管進行作用，讓氧氣進入血液。",
  "questionText": "根據上文，肺泡在這段情境中最主要的功能是什麼？",
  "options": ["過濾空氣中的灰塵", "幫助食物消化", "進行氣體交換", "製造血液"],
  "answer": "進行氣體交換",
  "explanation": "題幹描述的是氧氣進入血液的過程，肺泡最主要功能是進行氣體交換。"
}
```

## 對接注意事項

- `subjectId` 與 `unitId` 由系統固定給定，不是 AI 自由產生
- AI 主要負責 `concept` 分類
- `questionStyle` 固定為 `literacy`
- `passage` 應有生活情境與較長敘述
- `confidence` 用 0 到 1
- `options` 固定 4 個
- `answer` 直接放完整選項文字
- `explanation` 控制在 1 到 3 句
