WITH RECURSIVE branch AS (
  SELECT 
    id,
    type,
    "fileUrl"
  FROM 
    "Block"
  WHERE 
    id = $1

  UNION

  SELECT 
    b.id,
    b.type,
    b."fileUrl"
  FROM 
    "Block" b
  INNER JOIN branch ON b."parentFolderId" = branch.id
)

SELECT 
  "fileUrl"
FROM 
  branch
WHERE
  type = 'FILE';
