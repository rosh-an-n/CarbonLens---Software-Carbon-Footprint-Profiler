from docx import Document

def get_tables(file_path):
    doc = Document(file_path)
    for i, table in enumerate(doc.tables):
        print(f"--- Table {i} ---")
        for row in table.rows:
            print(" | ".join(cell.text.strip().replace('\n', ' ') for cell in row.cells))

if __name__ == "__main__":
    get_tables("/Users/roshan/Projects/Software Carbon Footprint Profiler/CarbonLens_PBL_Report.docx")
